import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

declare global {
  interface Window {
    occtimportjs?: (options?: Record<string, unknown>) => Promise<any>;
  }
}

let loaderPromise: Promise<any> | null = null;

const flattenNumbers = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];
  return value.flat(Infinity).map(Number).filter(Number.isFinite);
};

const ensureOcct = async () => {
  if (window.occtimportjs) {
    return window.occtimportjs({
      locateFile: (name: string) =>
        name.endsWith('.wasm') ? '/occt/occt-import-js.wasm' : name,
    });
  }

  if (!loaderPromise) {
    loaderPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/occt/occt-import-js.js';
      script.async = true;
      script.onload = async () => {
        try {
          if (!window.occtimportjs) {
            throw new Error('occt-import-js global factory missing');
          }
          resolve(await window.occtimportjs({
            locateFile: (name: string) =>
              name.endsWith('.wasm') ? '/occt/occt-import-js.wasm' : name,
          }));
        } catch (error) {
          reject(error);
        }
      };
      script.onerror = () => reject(new Error('failed to load OCCT browser importer'));
      document.head.appendChild(script);
    });
  }

  return loaderPromise;
};

export interface StepDerivedPreview {
  url: string;
  vertices: number;
  polygons: number;
  meshCount: number;
}

export const stepToDerivedGlb = async (stepUrl: string): Promise<StepDerivedPreview> => {
  const [occt, THREE] = await Promise.all([
    ensureOcct(),
    import('three'),
  ]);

  const response = await fetch(stepUrl);
  if (!response.ok) {
    throw new Error(`STEP fetch failed: HTTP ${response.status}`);
  }

  const source = new Uint8Array(await response.arrayBuffer());
  const result = occt.ReadStepFile(source, {
    linearUnit: 'millimeter',
    linearDeflectionType: 'bounding_box_ratio',
    linearDeflection: 0.003,
    angularDeflection: 0.5,
  });

  if (!result?.success || !Array.isArray(result.meshes) || result.meshes.length === 0) {
    throw new Error('OCCT could not triangulate the verified STEP artifact');
  }

  const scene = new THREE.Scene();
  const root = new THREE.Group();
  scene.add(root);

  let vertices = 0;
  let polygons = 0;

  for (const sourceMesh of result.meshes) {
    const positions = flattenNumbers(sourceMesh?.attributes?.position?.array);
    const normals = flattenNumbers(sourceMesh?.attributes?.normal?.array);
    const indices = flattenNumbers(sourceMesh?.index?.array);

    if (positions.length < 9 || indices.length < 3) continue;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    if (normals.length === positions.length) {
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    } else {
      geometry.computeVertexNormals();
    }

    geometry.setIndex(indices);

    const sourceColor = Array.isArray(sourceMesh?.color)
      ? sourceMesh.color
      : [0.82, 0.86, 0.9];

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(
        Number(sourceColor[0] ?? 0.82),
        Number(sourceColor[1] ?? 0.86),
        Number(sourceColor[2] ?? 0.9),
      ),
      metalness: 0.15,
      roughness: 0.55,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = String(sourceMesh?.name || 'STEP mesh');
    root.add(mesh);

    vertices += Math.floor(positions.length / 3);
    polygons += Math.floor(indices.length / 3);
  }

  if (root.children.length === 0) {
    throw new Error('STEP artifact contained no renderable triangulated mesh');
  }

  const box = new THREE.Box3().setFromObject(root);
  const center = new THREE.Vector3();
  box.getCenter(center);
  root.position.sub(center);

  const exporter = new GLTFExporter();
  const binary = await exporter.parseAsync(scene, {
    binary: true,
    onlyVisible: true,
  });

  if (!(binary instanceof ArrayBuffer)) {
    throw new Error('GLTFExporter did not return binary GLB');
  }

  const url = URL.createObjectURL(new Blob([binary], { type: 'model/gltf-binary' }));

  return {
    url,
    vertices,
    polygons,
    meshCount: root.children.length,
  };
};
