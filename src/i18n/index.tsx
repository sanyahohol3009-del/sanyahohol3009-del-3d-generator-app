import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppLanguage } from '../types';

export const LANGUAGE_STORAGE_KEY = 'golem.language';

export interface TranslationDictionary {
  // Navigation & Top bar
  appTitle: string;
  appSubtitle: string;
  splitView: string;
  appView: string;
  codeView: string;
  voiceToggle: string;
  voiceModePrefix: string;
  audioDiagnosticTitle: string;
  audioDiagnosticSuccess: string;
  audioDiagnosticUnavailable: string;
  comparatorTitle: string;
  projectBrowserTitle: string;
  openDrawer: string;
  syncOnline: string;
  synthPrefix: string;

  // Plus menu & Vision tools hub
  inputPeripheralsHeader: string;
  inputSubHeader: string;
  toolPhoto: string;
  toolPhotoSub: string;
  toolFile: string;
  toolFileSub: string;
  toolCamera: string;
  toolCameraSub: string;
  toolCapture: string;
  toolCaptureSub: string;
  toolDrawing: string;
  toolDrawingSub: string;
  pipelineFootnote: string;

  // Camera modes
  modeAuto: string;
  modeMeasure: string;
  modeCapture: string;
  modeDrawing: string;

  // Camera lifecycle & errors
  cameraOpening: string;
  cameraLive: string;
  cameraCapturing: string;
  cameraClosing: string;
  cameraError: string;
  cameraPermissionDenied: string;
  cameraNotFound: string;
  cameraInUse: string;
  cameraInterrupted: string;
  cameraUnsupported: string;
  cameraUnknownError: string;
  cameraRetryBtn: string;
  cameraChoosePhotoBtn: string;
  cameraSwitchFacingBtn: string;
  cameraExitBtn: string;
  cameraBackToChat: string;
  cameraShutterLabel: string;
  cameraShutterCapturing: string;
  cameraUnavailablePrompt: string;
  cameraSensorReady: string;

  // Camera HUD Guidance & Backend States
  hudSearchingScale: string;
  hudScaleCandidate: string;
  hudRulerDetected: string;
  hudArucoDetected: string;
  hudScaleLocked: string;
  hudSearchingObject: string;
  hudObjectCandidate: string;
  hudObjectLocked: string;
  hudHoldSteady: string;
  hudMoveCloser: string;
  hudMoveFarther: string;
  hudReduceAngle: string;
  hudMoreLight: string;
  hudObjectOccluded: string;
  hudScaleLost: string;
  hudMeasurementVerified: string;
  hudLowConfidence: string;
  hudNeedAnotherView: string;

  // Object Lock UX
  objectLockCandidate: string;
  objectLockTapHint: string;
  objectLockSelected: string;
  objectLockLockBtn: string;
  objectLockUnlockBtn: string;
  objectLockClearBtn: string;
  objectLockConfidence: string;
  objectLockNotice: string;

  // Object Capture Mode
  captureTitle: string;
  captureShellNotice: string;
  captureFrames: string;
  captureCoverage: string;
  captureAngleProgress: string;
  captureBlurWarning: string;
  captureLightingWarning: string;
  captureInsufficientCoverage: string;
  captureStartBtn: string;
  captureNextAngleBtn: string;
  captureFinishBtn: string;
  captureResetBtn: string;
  captureDirectionLeft: string;
  captureDirectionRight: string;
  captureDirectionUp: string;
  captureDirectionDown: string;
  captureDirectionHold: string;
  captureSectorFront: string;
  captureSectorFrontRight: string;
  captureSectorRight: string;
  captureSectorBackRight: string;
  captureSectorBack: string;
  captureSectorBackLeft: string;
  captureSectorLeft: string;
  captureSectorFrontLeft: string;
  captureSectorTop: string;

  // Drawing to CAD workflow
  drawingTitle: string;
  drawingReviewHeader: string;
  drawingReviewSub: string;
  drawingUncertainNotice: string;
  drawingTargetCad: string;
  drawingDimWidth: string;
  drawingDimHeight: string;
  drawingDimHole: string;
  drawingDimOffsetX: string;
  drawingDimOffsetY: string;
  drawingActionConfirm: string;
  drawingActionEdit: string;
  drawingActionReject: string;
  drawingSendCadBtn: string;
  drawingDiscardBtn: string;

  // Vision Attachment States & Badges
  badgeProcessing: string;
  badgeVerified: string;
  badgeApproximate: string;
  badgeReferenceOnly: string;
  badgeNeedMoreInput: string;
  badgeFailed: string;
  visionDepthLimitation: string;
  visionArUcoScaleLabel: string;
  attachedScanIngested: string;
  removeAttachment: string;

  // Chat & Input Bar
  quickSynthPrefix: string;
  inputPlaceholderNormal: string;
  inputPlaceholderSynthesizing: string;
  transmitBtnTitle: string;
  operatorSender: string;
  golemGuardian: string;
  bootMessage: string;
  attachedReferenceFallback: string;
  attachedVerifiedFallback: string;

  // Drawer
  drawerTagline: string;
  drawerTabVaults: string;
  drawerTabHistory: string;
  drawerSettingsSection: string;
  drawerStorageSection: string;
  drawerCoreStatus: string;
  drawerVersion: string;
  drawerSearchPlaceholder: string;
  drawerReaccessBtn: string;
  drawerInspectBtn: string;
  drawerCollapseBtn: string;
  drawerCopyJsonBtn: string;
  drawerCopiedJson: string;
  drawerEmptyHistory: string;
  drawerTotalAssets: string;
  drawerShareBtn: string;
  drawerCopiedLink: string;
  drawerComparatorBtn: string;
  drawerCompareSingleBtn: string;
  drawerTelemetryLink: string;
  drawerDiagnosticsSection: string;
  drawerDownloadLogBtn: string;
  drawerDownloadingLog: string;
  drawerLogSubtitle: string;
  drawerLogAssets: string;
  drawerLogPolygons: string;
  drawerQuickLogBtn: string;

  // Project Browser
  projectsTitle: string;
  projectsSubTitle: string;
  projectsEmpty: string;
  projectsSelectPrompt: string;
  projectsVersionHeader: string;
  projectsArtifactsHeader: string;
  projectsModifyTitle: string;
  projectsModifyPlaceholder: string;
  projectsModifyBtn: string;
  projectsModifying: string;
  projectsDownloadBtn: string;
  projectsRefreshBtn: string;
  projectsCloseBtn: string;

  // Snackbars & Common Actions
  snackLangSwitched: string;
  snackModelReaccessed: string;
  snackComparatorOpened: string;
  snackLogDownloaded: string;
  snackVisionAnalyzing: string;
  snackVisionVerified: string;
  snackVisionReference: string;
  snackFileAttached: string;
  close: string;
  cancel: string;
  confirm: string;
  retry: string;

  checkingAruco: string;
  imageTooLarge: string;
  tagline: string;
  neuralMeshBusy: string;
  neuralLatticeOnline: string;
  headerProjects: string;
  headerComparator: string;
  headerSimulation: string;
  headerSplitView: string;
  headerRuntime: string;
  statusSyncOnline: string;
  addPeripheralTitle: string;
  executing3DTask: string;
  describe3DTask: string;
  synthesisInProgress: string;
  transmitToGolem: string;
}

export const translations: Record<AppLanguage, TranslationDictionary> = {
  ru: {
    appTitle: 'GOLEM // 3D & CAD СИСТЕМА',
    appSubtitle: 'АВТОНОМНЫЙ ОРГАН ГЕОМЕТРИЧЕСКОГО СИНТЕЗА',
    splitView: 'СПЛИТ-РЕЖИМ',
    appView: 'ИНТЕРФЕЙС',
    codeView: 'КОД FLUTTER',
    voiceToggle: 'ГОЛОСОВОЙ КЛИЕНТ',
    voiceModePrefix: 'РЕЖИМ ГОЛОСА',
    audioDiagnosticTitle: 'Аудио-диагностика',
    audioDiagnosticSuccess: 'Аудио-диагностика: выполнен реальный тестовый сигнал 432 Гц.',
    audioDiagnosticUnavailable: 'Аудио-диагностика недоступна на этой платформе.',
    comparatorTitle: 'Синтез-компаратор',
    projectBrowserTitle: 'Проводник проектов CAD',
    openDrawer: 'Открыть меню',
    syncOnline: 'СИНХР // В СЕТИ',
    synthPrefix: 'СИНТЕЗ:',

    inputPeripheralsHeader: 'ВВОД И ПЕРИФЕРИЯ // МАТРИЦА СБОРА ДАННЫХ',
    inputSubHeader: 'ВЫБЕРИТЕ ИНСТРУМЕНТ GOLEM VISION ИЛИ ФАЙЛОВЫЙ ИСТОЧНИК',
    toolPhoto: 'Фото / Vision',
    toolPhotoSub: 'Галерея / Анализ ArUco',
    toolFile: 'Файл',
    toolFileSub: 'OBJ / STEP / CAD / PDF',
    toolCamera: 'Vision-камера',
    toolCameraSub: 'ARUCO / МЕТРИКА / СЕТКА',
    toolCapture: 'Захват объекта',
    toolCaptureSub: 'Круговая фотограмметрия',
    toolDrawing: 'Чертёж / CAD',
    toolDrawingSub: 'Чертежи в FreeCAD/OpenSCAD',
    pipelineFootnote: 'ФОТО / КАМЕРА → OPENCV ПРИ НАЛИЧИИ ARUCO → 3D КОНВЕЙЕР GOLEM',

    modeAuto: 'АВТО',
    modeMeasure: 'ИЗМЕРЕНИЕ',
    modeCapture: 'ЗАХВАТ',
    modeDrawing: 'ЧЕРТЁЖ',

    cameraOpening: 'Инициализация сенсора камеры...',
    cameraLive: 'Оптический канал активен',
    cameraCapturing: 'Фиксация оптического кадра...',
    cameraClosing: 'Освобождение сенсора камеры...',
    cameraError: 'Ошибка оптического сенсора',
    cameraPermissionDenied: 'Доступ к камере заблокирован в разрешениях браузера.',
    cameraNotFound: 'Оптическая камера не обнаружена в системе.',
    cameraInUse: 'Камера занята другим приложением или процессом.',
    cameraInterrupted: 'Поток камеры был прерван системой.',
    cameraUnsupported: 'WebRTC/getUserMedia не поддерживается в этом окружении.',
    cameraUnknownError: 'Не удалось запустить видеопоток камеры.',
    cameraRetryBtn: 'ПОВТОРИТЬ ПОДКЛЮЧЕНИЕ',
    cameraChoosePhotoBtn: 'ВЫБРАТЬ ФОТО ИЗ ФАЙЛА',
    cameraSwitchFacingBtn: 'СМЕНИТЬ КАМЕРУ',
    cameraExitBtn: 'НАЗАД В ЧАТ',
    cameraBackToChat: 'НАЗАД В ЧАТ',
    cameraShutterLabel: 'СНИМОК ДЛЯ GOLEM VISION',
    cameraShutterCapturing: 'ФИКСАЦИЯ КАДРА...',
    cameraUnavailablePrompt: 'КАМЕРА НЕДОСТУПНА · ВЫБЕРИТЕ ФОТО',
    cameraSensorReady: 'ОПТИЧЕСКАЯ МАТРИЦА // ARUCO 50 ММ ГОТОВА',

    hudSearchingScale: 'ПОИСК МАСШТАБА',
    hudScaleCandidate: 'КАНДИДАТ МАСШТАБА',
    hudRulerDetected: 'ЛИНЕЙКА НАЙДЕНА',
    hudArucoDetected: 'МАРКЕР ARUCO ОБНАРУЖЕН',
    hudScaleLocked: 'МАСШТАБ ЗАФИКСИРОВАН',
    hudSearchingObject: 'ПОИСК ОБЪЕКТА',
    hudObjectCandidate: 'КАНДИДАТ ОБЪЕКТА',
    hudObjectLocked: 'ОБЪЕКТ ЗАХВАЧЕН',
    hudHoldSteady: 'ДЕРЖИТЕ НЕПОДВИЖНО',
    hudMoveCloser: 'ПРИБЛИЗЬТЕ КАМЕРУ',
    hudMoveFarther: 'ОТОДВИНЬТЕ КАМЕРУ',
    hudReduceAngle: 'УМЕНЬШИТЕ УГОЛ НАКЛОНА',
    hudMoreLight: 'ТРЕБУЕТСЯ БОЛЬШЕ СВЕТА',
    hudObjectOccluded: 'ОБЪЕКТ ПЕРЕКРЫТ',
    hudScaleLost: 'МАСШТАБ ПОТЕРЯН',
    hudMeasurementVerified: 'ИЗМЕРЕНИЕ ВЕРИФИЦИРОВАНО',
    hudLowConfidence: 'НИЗКАЯ ТОЧНОСТЬ',
    hudNeedAnotherView: 'ТРЕБУЕТСЯ ДРУГОЙ РАКУРС',

    objectLockCandidate: 'КАНДИДАТ ОБЪЕКТА',
    objectLockTapHint: 'Нажмите на экран для выделения рамки',
    objectLockSelected: 'РАМКА ВЫБРАНА',
    objectLockLockBtn: 'ЗАФИКСИРОВАТЬ',
    objectLockUnlockBtn: 'РАЗБЛОКИРОВАТЬ',
    objectLockClearBtn: 'СБРОСИТЬ ВЫБОР',
    objectLockConfidence: 'ТОЧНОСТЬ',
    objectLockNotice: 'Интерфейс фиксации объекта (подготовка к серверной сегментации)',

    captureTitle: 'ЗАХВАТ ОБЪЕКТА // ФОТОГРАММЕТРИЯ',
    captureShellNotice: 'Оболочка кругового захвата. Реконструкция ожидает серверный движок (COLMAP/OpenMVS).',
    captureFrames: 'Кадров',
    captureCoverage: 'Покрытие ракурсов',
    captureAngleProgress: 'Угол обхода',
    captureBlurWarning: 'ВНИМАНИЕ: Смаз изображения! Держите устройство ровно.',
    captureLightingWarning: 'ВНИМАНИЕ: Недостаточное освещение для сопоставления точек.',
    captureInsufficientCoverage: 'Недостаточно углов обхода для 3D реконструкции (нужно минимум 8).',
    captureStartBtn: 'НАЧАТЬ ЗАХВАТ',
    captureNextAngleBtn: 'ЗАФИКСИРОВАТЬ РАКУРС',
    captureFinishBtn: 'ЗАВЕРШИТЬ ЗАХВАТ',
    captureResetBtn: 'СБРОСИТЬ СЕРИЮ',
    captureDirectionLeft: 'СМЕСТИТЕСЬ ЛЕВЕЕ',
    captureDirectionRight: 'СМЕСТИТЕСЬ ПРАВЕЕ',
    captureDirectionUp: 'ПОДНИМИТЕ КАМЕРУ ВЫШЕ',
    captureDirectionDown: 'ОПУСТИТЕ КАМЕРУ НИЖЕ',
    captureDirectionHold: 'УДЕРЖИВАЙТЕ ОБЪЕКТ В ЦЕНТРЕ',
    captureSectorFront: 'Спереди',
    captureSectorFrontRight: 'Спереди-справа',
    captureSectorRight: 'Справа',
    captureSectorBackRight: 'Сзади-справа',
    captureSectorBack: 'Сзади',
    captureSectorBackLeft: 'Сзади-слева',
    captureSectorLeft: 'Слева',
    captureSectorFrontLeft: 'Спереди-слева',
    captureSectorTop: 'Сверху (опция)',

    drawingTitle: 'ЧЕРТЁЖ / BLUEPRINT В CAD',
    drawingReviewHeader: 'ПАРАМЕТРИЧЕСКИЙ АНАЛИЗ ЧЕРТЕЖА',
    drawingReviewSub: 'Извлечённые геометрические размеры перед генерацией твердотельной CAD-модели',
    drawingUncertainNotice: 'Сомнительные размеры не принимаются за истину CAD без подтверждения оператором.',
    drawingTargetCad: 'Целевой САПР-движок:',
    drawingDimWidth: 'Ширина (Width)',
    drawingDimHeight: 'Высота (Height)',
    drawingDimHole: 'Отверстие (Hole Ø)',
    drawingDimOffsetX: 'Смещение X (Offset X)',
    drawingDimOffsetY: 'Смещение Y (Offset Y)',
    drawingActionConfirm: 'ПОДТВЕРДИТЬ',
    drawingActionEdit: 'ИЗМЕНИТЬ',
    drawingActionReject: 'ОТКЛОНИТЬ',
    drawingSendCadBtn: 'ОТПРАВИТЬ В CAD ПАЙПЛАЙН',
    drawingDiscardBtn: 'ОТМЕНИТЬ ЧЕРТЁЖ',

    badgeProcessing: 'VISION В ОБРАБОТКЕ',
    badgeVerified: 'VISION ВЕРИФИЦИРОВАНО',
    badgeApproximate: 'ПРИБЛИЗИТЕЛЬНО',
    badgeReferenceOnly: 'ТОЛЬКО ДЛЯ СПРАВКИ',
    badgeNeedMoreInput: 'ТРЕБУЕТСЯ ДРУГОЙ РАКУРС',
    badgeFailed: 'ОШИБКА АНАЛИЗА',
    visionDepthLimitation: 'Физическая глубина Z не верифицирована по плоскому кадру',
    visionArUcoScaleLabel: 'МАСШТАБ: ARUCO 50 ММ',
    attachedScanIngested: 'ОПТИЧЕСКИЙ КАДР ЗАГРУЖЕН',
    removeAttachment: 'Удалить вложение',

    quickSynthPrefix: 'БЫСТРЫЙ СИНТЕЗ:',
    inputPlaceholderNormal: 'Опишите задачу 3D/CAD синтеза...',
    inputPlaceholderSynthesizing: 'Выполняется верифицированная задача CAD...',
    transmitBtnTitle: 'Передать в GOLEM',
    operatorSender: 'ОПЕРАТОР',
    golemGuardian: 'GOLEM // ХРАНИТЕЛЬ',
    bootMessage: 'Интерфейс GOLEM инициализирован. Настройте узел 3D/CAD в меню или отправьте запрос.',
    attachedReferenceFallback: 'Проанализируйте прикреплённую референс-картинку без фальсификации геометрии.',
    attachedVerifiedFallback: 'Используйте верифицированные размеры камеры как геометрический ввод. Не додумывайте недостающую глубину.',

    drawerTagline: 'АВТОНОМНЫЙ ХРАНИТЕЛЬ 3D СИНТЕЗА',
    drawerTabVaults: 'ХРАНИЛИЩА И УЗЕЛ',
    drawerTabHistory: 'ИСТОРИЯ СИНТЕЗА',
    drawerSettingsSection: 'ЛОКАЛИЗАЦИЯ СИСТЕМЫ',
    drawerStorageSection: 'ХРАНИЛИЩА ПАМЯТИ',
    drawerCoreStatus: 'ЯДРО В СЕТИ',
    drawerVersion: 'v2.4-LOCAL',
    drawerSearchPlaceholder: 'Фильтр сгенерированных моделей...',
    drawerReaccessBtn: 'ПЕРЕЙТИ В ЧАТЕ',
    drawerInspectBtn: 'ПОКАЗАТЬ ТЕЛЕМЕТРИЮ',
    drawerCollapseBtn: 'СКРЫТЬ ТЕЛЕМЕТРИЮ',
    drawerCopyJsonBtn: 'СКОПИРОВАТЬ JSON',
    drawerCopiedJson: 'JSON СКОПИРОВАН',
    drawerEmptyHistory: 'Нет сгенерированных моделей.',
    drawerTotalAssets: 'Всего 3D-моделей',
    drawerShareBtn: 'ПОДЕЛИТЬСЯ',
    drawerCopiedLink: 'ССЫЛКА СКОПИРОВАНА',
    drawerComparatorBtn: 'СИНТЕЗ-КОМПАРАТОР // 3D СРАВНЕНИЕ',
    drawerCompareSingleBtn: 'СРАВНИТЬ',
    drawerTelemetryLink: 'ССЫЛКА ТЕЛЕМЕТРИИ СЕТКИ',
    drawerDiagnosticsSection: 'ДИАГНОСТИКА И ЛОГИ СЕССИИ',
    drawerDownloadLogBtn: 'СКАЧАТЬ ЛОГ ДИАГНОСТИКИ',
    drawerDownloadingLog: 'ЛОГ СКАЧАН',
    drawerLogSubtitle: 'Структурированная телеметрия синтеза, метаданные геометрии и таймстемпы.',
    drawerLogAssets: '3D-активов',
    drawerLogPolygons: 'Всего полигонов',
    drawerQuickLogBtn: 'СКАЧАТЬ ЛОГ СЕССИИ',

    projectsTitle: 'ПРОВОДНИК ПРОЕКТОВ CAD',
    projectsSubTitle: 'АВТОРИТЕТНЫЕ ВЕРСИИ И АРТЕФАКТЫ ПРОЕКТОВ',
    projectsEmpty: 'Проектов не найдено в хранилище.',
    projectsSelectPrompt: 'Выберите проект из списка слева для просмотра артефактов и истории версий.',
    projectsVersionHeader: 'ВЕРСИЯ ПРОЕКТА',
    projectsArtifactsHeader: 'АРТЕФАКТЫ ВЕРСИИ',
    projectsModifyTitle: 'МОДИФИКАЦИЯ ПАРАМЕТРИЧЕСКОЙ МОДЕЛИ',
    projectsModifyPlaceholder: 'Инструкция для изменения (например, добавить хвост, изменить масштаб)...',
    projectsModifyBtn: 'ПРИМЕНИТЬ ИЗМЕНЕНИЯ',
    projectsModifying: 'Генерация новой версии...',
    projectsDownloadBtn: 'Скачать',
    projectsRefreshBtn: 'Обновить список',
    projectsCloseBtn: 'Закрыть проводник',

    snackLangSwitched: 'Язык интерфейса переключён на: РУССКИЙ',
    snackModelReaccessed: 'Выбрана 3D модель:',
    snackComparatorOpened: 'Компаратор открыт для сравнения',
    snackLogDownloaded: 'Лог диагностики сохранён:',
    snackVisionAnalyzing: 'Кадр прикреплён · GOLEM Vision проверяет метрическую плоскость ArUco...',
    snackVisionVerified: 'VISION ВЕРИФИЦИРОВАНО · ArUco 50 мм',
    snackVisionReference: 'Прикреплено как референс · ArUco маркер не обнаружен.',
    snackFileAttached: 'Файл загружен:',
    close: 'Закрыть',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    retry: 'Повторить',

    checkingAruco: 'GOLEM Vision проверяет метрическую плоскость ArUco...',
    imageTooLarge: 'Изображение слишком большое; максимум 12 МБ.',
    tagline: 'АВТОНОМНЫЙ ХРАНИТЕЛЬ 3D СИНТЕЗА',
    neuralMeshBusy: 'НЕЙРОСЕТЕВОЙ РАСЧЁТ СЕТКИ',
    neuralLatticeOnline: 'НЕЙРОННАЯ РЕШЁТКА АКТИВНА',
    headerProjects: 'ПРОЕКТЫ',
    headerComparator: '3D КОМПАРАТОР',
    headerSimulation: 'Симуляция',
    headerSplitView: 'Сплит-вид',
    headerRuntime: 'Рантайм',
    statusSyncOnline: 'СИНХРОНИЗАЦИЯ // ОНЛАЙН',
    addPeripheralTitle: 'Добавить Фото / Файл / Камеру',
    executing3DTask: 'Выполнение проверенной 3D/CAD задачи...',
    describe3DTask: 'Опишите 3D/CAD задачу...',
    synthesisInProgress: 'Идёт синтез',
    transmitToGolem: 'Отправить в GOLEM',
  },

  en: {
    appTitle: 'GOLEM // 3D & CAD SYSTEM',
    appSubtitle: 'AUTONOMOUS GEOMETRIC SYNTHESIS ORGAN',
    splitView: 'SPLIT VIEW',
    appView: 'APP VIEW',
    codeView: 'FLUTTER CODE',
    voiceToggle: 'VOICE CLIENT',
    voiceModePrefix: 'VOICE MODE',
    audioDiagnosticTitle: 'Audio Diagnostic',
    audioDiagnosticSuccess: 'Audio diagnostic: real 432 Hz test tone emitted.',
    audioDiagnosticUnavailable: 'Audio diagnostic is unavailable on this platform.',
    comparatorTitle: 'Synthesis Comparator',
    projectBrowserTitle: 'CAD Project Browser',
    openDrawer: 'Open Menu',
    syncOnline: 'SYNC // ONLINE',
    synthPrefix: 'SYNTH:',

    inputPeripheralsHeader: 'INPUT PERIPHERALS // INGEST MATRIX',
    inputSubHeader: 'SELECT GOLEM VISION SENSOR OR FILE SOURCE',
    toolPhoto: 'Photo / Reference',
    toolPhotoSub: 'Gallery / ArUco Analysis',
    toolFile: 'File',
    toolFileSub: 'OBJ / STEP / CAD / PDF',
    toolCamera: 'Vision Camera',
    toolCameraSub: 'ARUCO / METRIC / GRID',
    toolCapture: 'Object Capture',
    toolCaptureSub: 'Orbital Photogrammetry',
    toolDrawing: 'Drawing / Blueprint',
    toolDrawingSub: 'Blueprints to FreeCAD/OpenSCAD',
    pipelineFootnote: 'PHOTO / CAMERA → OPENCV WHEN ARUCO IS PRESENT → GOLEM 3D PIPELINE',

    modeAuto: 'AUTO',
    modeMeasure: 'MEASURE',
    modeCapture: 'OBJECT CAPTURE',
    modeDrawing: 'DRAWING',

    cameraOpening: 'Initializing optical sensor...',
    cameraLive: 'Optical channel active',
    cameraCapturing: 'Capturing optical frame...',
    cameraClosing: 'Releasing optical sensor...',
    cameraError: 'Optical sensor error',
    cameraPermissionDenied: 'Camera permission was denied in your browser settings.',
    cameraNotFound: 'No optical camera device found on this system.',
    cameraInUse: 'Camera is currently in use by another application.',
    cameraInterrupted: 'Camera video stream was interrupted.',
    cameraUnsupported: 'WebRTC / getUserMedia is not supported in this runtime environment.',
    cameraUnknownError: 'Failed to initialize video stream from camera.',
    cameraRetryBtn: 'RETRY CONNECTION',
    cameraChoosePhotoBtn: 'CHOOSE PHOTO FROM FILE',
    cameraSwitchFacingBtn: 'SWITCH CAMERA',
    cameraExitBtn: 'BACK TO CHAT',
    cameraBackToChat: 'BACK TO CHAT',
    cameraShutterLabel: 'CAPTURE FOR GOLEM VISION',
    cameraShutterCapturing: 'CAPTURING VISION FRAME...',
    cameraUnavailablePrompt: 'CAMERA UNAVAILABLE · USE + PHOTO',
    cameraSensorReady: 'OPTICAL SENSOR MATRIX // ARUCO 50 MM READY',

    hudSearchingScale: 'SEARCHING FOR SCALE',
    hudScaleCandidate: 'SCALE CANDIDATE',
    hudRulerDetected: 'RULER DETECTED',
    hudArucoDetected: 'ARUCO DETECTED',
    hudScaleLocked: 'SCALE LOCKED',
    hudSearchingObject: 'SEARCHING FOR OBJECT',
    hudObjectCandidate: 'OBJECT CANDIDATE',
    hudObjectLocked: 'OBJECT LOCKED',
    hudHoldSteady: 'HOLD STEADY',
    hudMoveCloser: 'MOVE CLOSER',
    hudMoveFarther: 'MOVE FARTHER',
    hudReduceAngle: 'REDUCE CAMERA ANGLE',
    hudMoreLight: 'MORE LIGHT REQUIRED',
    hudObjectOccluded: 'OBJECT OCCLUDED',
    hudScaleLost: 'SCALE LOST',
    hudMeasurementVerified: 'MEASUREMENT VERIFIED',
    hudLowConfidence: 'LOW CONFIDENCE',
    hudNeedAnotherView: 'NEED ANOTHER VIEW',

    objectLockCandidate: 'OBJECT CANDIDATE',
    objectLockTapHint: 'Tap viewfinder to select bounding box',
    objectLockSelected: 'BOUNDING BOX SELECTED',
    objectLockLockBtn: 'LOCK SELECTION',
    objectLockUnlockBtn: 'UNLOCK',
    objectLockClearBtn: 'CLEAR SELECTION',
    objectLockConfidence: 'CONFIDENCE',
    objectLockNotice: 'Object lock interface (prepared for server-side segmentation)',

    captureTitle: 'OBJECT CAPTURE // PHOTOGRAMMETRY',
    captureShellNotice: 'Orbital capture shell. 3D reconstruction awaits backend engine (COLMAP/OpenMVS).',
    captureFrames: 'Frames',
    captureCoverage: 'Coverage',
    captureAngleProgress: 'Angle Progress',
    captureBlurWarning: 'WARNING: Motion blur detected! Hold device steady.',
    captureLightingWarning: 'WARNING: Insufficient illumination for feature matching.',
    captureInsufficientCoverage: 'Insufficient orbital coverage for 3D reconstruction (minimum 8 views needed).',
    captureStartBtn: 'START CAPTURE',
    captureNextAngleBtn: 'CAPTURE CURRENT ANGLE',
    captureFinishBtn: 'FINISH CAPTURE',
    captureResetBtn: 'RESET SEQUENCE',
    captureDirectionLeft: 'MOVE TO THE LEFT',
    captureDirectionRight: 'MOVE TO THE RIGHT',
    captureDirectionUp: 'RAISE CAMERA HIGHER',
    captureDirectionDown: 'LOWER CAMERA',
    captureDirectionHold: 'KEEP OBJECT CENTERED',
    captureSectorFront: 'Front',
    captureSectorFrontRight: 'Front-Right',
    captureSectorRight: 'Right',
    captureSectorBackRight: 'Back-Right',
    captureSectorBack: 'Back',
    captureSectorBackLeft: 'Back-Left',
    captureSectorLeft: 'Left',
    captureSectorFrontLeft: 'Front-Left',
    captureSectorTop: 'Top (optional)',

    drawingTitle: 'DRAWING / BLUEPRINT TO CAD',
    drawingReviewHeader: 'PARAMETRIC DRAWING REVIEW',
    drawingReviewSub: 'Extracted geometric dimensions prior to solid CAD generation',
    drawingUncertainNotice: 'Uncertain dimensions must not be automatically treated as CAD truth.',
    drawingTargetCad: 'Target CAD Engine:',
    drawingDimWidth: 'Width',
    drawingDimHeight: 'Height',
    drawingDimHole: 'Hole Ø',
    drawingDimOffsetX: 'Offset X',
    drawingDimOffsetY: 'Offset Y',
    drawingActionConfirm: 'CONFIRM',
    drawingActionEdit: 'EDIT',
    drawingActionReject: 'REJECT',
    drawingSendCadBtn: 'TRANSMIT TO CAD PIPELINE',
    drawingDiscardBtn: 'DISCARD DRAWING',

    badgeProcessing: 'VISION PROCESSING',
    badgeVerified: 'VISION VERIFIED',
    badgeApproximate: 'APPROXIMATE',
    badgeReferenceOnly: 'REFERENCE IMAGE',
    badgeNeedMoreInput: 'NEED MORE INPUT',
    badgeFailed: 'VISION FAILED',
    visionDepthLimitation: 'Physical depth unverified in single planar view',
    visionArUcoScaleLabel: 'SCALE: ARUCO 50 MM',
    attachedScanIngested: 'OPTICAL SCAN ATTACHED',
    removeAttachment: 'Remove attachment',

    quickSynthPrefix: 'QUICK SYNTH:',
    inputPlaceholderNormal: 'Describe a 3D/CAD task...',
    inputPlaceholderSynthesizing: 'Executing verified 3D/CAD task...',
    transmitBtnTitle: 'Transmit to GOLEM',
    operatorSender: 'OPERATOR',
    golemGuardian: 'GOLEM // GUARDIAN',
    bootMessage: 'GOLEM UI initialized. Configure the 3D/CAD Compute Node in the drawer, then send a real mesh or CAD request.',
    attachedReferenceFallback: 'Analyze the attached reference without fabricating unavailable geometry.',
    attachedVerifiedFallback: 'Use the verified camera measurement as geometry input. Do not invent missing depth; ask for another view or dimension when required.',

    drawerTagline: 'AUTONOMOUS 3D SYNTHESIS COMPANION',
    drawerTabVaults: 'VAULTS & SYSTEM',
    drawerTabHistory: 'SYNTHESIS HISTORY',
    drawerSettingsSection: 'SYSTEM LOCALIZATION',
    drawerStorageSection: 'MEMORY & STORAGE VAULTS',
    drawerCoreStatus: 'CORE ONLINE',
    drawerVersion: 'v2.4-LOCAL',
    drawerSearchPlaceholder: 'Filter synthesized models...',
    drawerReaccessBtn: 'RE-ACCESS IN CHAT',
    drawerInspectBtn: 'INSPECT TELEMETRY',
    drawerCollapseBtn: 'HIDE TELEMETRY',
    drawerCopyJsonBtn: 'COPY ASSET JSON',
    drawerCopiedJson: 'COPIED JSON',
    drawerEmptyHistory: 'No synthesized models found.',
    drawerTotalAssets: 'Synthesized Assets',
    drawerShareBtn: 'SHARE',
    drawerCopiedLink: 'LINK COPIED',
    drawerComparatorBtn: 'SYNTHESIS COMPARATOR // 3D DIFF',
    drawerCompareSingleBtn: 'COMPARE',
    drawerTelemetryLink: 'STRUCTURED TELEMETRY LINK',
    drawerDiagnosticsSection: 'SESSION DIAGNOSTICS & LOGS',
    drawerDownloadLogBtn: 'GENERATE & DOWNLOAD LOG',
    drawerDownloadingLog: 'LOG GENERATED',
    drawerLogSubtitle: 'Structured telemetry of current synthesis events, geometry metadata & timestamps.',
    drawerLogAssets: 'Logged Assets',
    drawerLogPolygons: 'Total Polygons',
    drawerQuickLogBtn: 'EXPORT SESSION LOG',

    projectsTitle: 'CAD PROJECT BROWSER',
    projectsSubTitle: 'AUTHORITATIVE VERSIONS & ARTIFACT REPOSITORY',
    projectsEmpty: 'No CAD projects found in store.',
    projectsSelectPrompt: 'Select a project from the left panel to inspect artifacts and version history.',
    projectsVersionHeader: 'PROJECT VERSION',
    projectsArtifactsHeader: 'VERSION ARTIFACTS',
    projectsModifyTitle: 'MODIFY PARAMETRIC CHARACTER',
    projectsModifyPlaceholder: 'Instructions to modify geometry (e.g. increase tail, rescale limbs)...',
    projectsModifyBtn: 'APPLY MODIFICATION',
    projectsModifying: 'Generating modified version...',
    projectsDownloadBtn: 'Download',
    projectsRefreshBtn: 'Refresh Projects',
    projectsCloseBtn: 'Close Browser',

    snackLangSwitched: 'Language switched to: ENGLISH',
    snackModelReaccessed: 'Re-accessed 3D model:',
    snackComparatorOpened: 'Comparator opened for comparison',
    snackLogDownloaded: 'Diagnostic log downloaded:',
    snackVisionAnalyzing: 'Scan attached · GOLEM Vision checking ArUco metric plane...',
    snackVisionVerified: 'VISION VERIFIED · ArUco 50 mm',
    snackVisionReference: 'Attached as reference · no verified ArUco measurement.',
    snackFileAttached: 'File attached:',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    retry: 'Retry',

    checkingAruco: 'GOLEM Vision checking ArUco metric plane...',
    imageTooLarge: 'Image is too large; maximum is 12 MB.',
    tagline: 'AUTONOMOUS 3D SYNTHESIS COMPANION',
    neuralMeshBusy: 'NEURAL MESH COMPUTE BUSY',
    neuralLatticeOnline: 'NEURAL LATTICE ONLINE',
    headerProjects: 'PROJECTS',
    headerComparator: '3D COMPARATOR',
    headerSimulation: 'Simulation',
    headerSplitView: 'Split View',
    headerRuntime: 'Runtime',
    statusSyncOnline: 'SYNC // ONLINE',
    addPeripheralTitle: 'Add Photo / File / Camera',
    executing3DTask: 'Executing verified 3D/CAD task...',
    describe3DTask: 'Describe a 3D/CAD task...',
    synthesisInProgress: 'Synthesis in progress',
    transmitToGolem: 'Transmit to GOLEM',
  },

  de: {
    appTitle: 'GOLEM // 3D & CAD SYSTEM',
    appSubtitle: 'AUTONOMES ORGAN FÜR GEOMETRISCHE SYNTHESE',
    splitView: 'GETEILTE ANSICHT',
    appView: 'APP-ANSICHT',
    codeView: 'FLUTTER-CODE',
    voiceToggle: 'SPRACHCLIENT',
    voiceModePrefix: 'SPRACHMODUS',
    audioDiagnosticTitle: 'Audio-Diagnose',
    audioDiagnosticSuccess: 'Audio-Diagnose: Realer 432-Hz-Testton ausgegeben.',
    audioDiagnosticUnavailable: 'Audio-Diagnose auf dieser Plattform nicht verfügbar.',
    comparatorTitle: 'Synthese-Komparator',
    projectBrowserTitle: 'CAD-Projekt-Browser',
    openDrawer: 'Menü öffnen',
    syncOnline: 'SYNC // ONLINE',
    synthPrefix: 'SYNTH:',

    inputPeripheralsHeader: 'EINGABE-PERIPHERIE // ERFASSUNGSMATRIX',
    inputSubHeader: 'WÄHLEN SIE EIN GOLEM VISION-WERKZEUG ODER EINE DATEIQUELLE',
    toolPhoto: 'Foto / Vision',
    toolPhotoSub: 'Galerie / ArUco-Analyse',
    toolFile: 'Datei',
    toolFileSub: 'OBJ / STEP / CAD / PDF',
    toolCamera: 'Vision-Kamera',
    toolCameraSub: 'ARUCO / METRIK / GITTER',
    toolCapture: 'Objekterfassung',
    toolCaptureSub: 'Orbitale Photogrammetrie',
    toolDrawing: 'Zeichnung / CAD',
    toolDrawingSub: 'Baupläne zu FreeCAD/OpenSCAD',
    pipelineFootnote: 'FOTO / KAMERA → OPENCV BEI ARUCO-PRÄSENZ → GOLEM 3D-PIPELINE',

    modeAuto: 'AUTO',
    modeMeasure: 'MESSEN',
    modeCapture: 'ERFASSUNG',
    modeDrawing: 'ZEICHNUNG',

    cameraOpening: 'Initialisiere optischen Sensor...',
    cameraLive: 'Optischer Kanal aktiv',
    cameraCapturing: 'Erfasse optisches Einzelbild...',
    cameraClosing: 'Gebe optischen Sensor frei...',
    cameraError: 'Fehler des optischen Sensors',
    cameraPermissionDenied: 'Kamerazugriff wurde in den Browsereinstellungen verweigert.',
    cameraNotFound: 'Keine Kamera auf diesem System gefunden.',
    cameraInUse: 'Kamera wird aktuell von einer anderen Anwendung verwendet.',
    cameraInterrupted: 'Videostream der Kamera wurde unterbrochen.',
    cameraUnsupported: 'WebRTC / getUserMedia wird in dieser Laufzeitumgebung nicht unterstützt.',
    cameraUnknownError: 'Kameravideostream konnte nicht gestartet werden.',
    cameraRetryBtn: 'VERBINDUNG WIEDERHOLEN',
    cameraChoosePhotoBtn: 'FOTO AUS DATEI WÄHLEN',
    cameraSwitchFacingBtn: 'KAMERA WECHSELN',
    cameraExitBtn: 'ZURÜCK ZUM CHAT',
    cameraBackToChat: 'ZURÜCK ZUM CHAT',
    cameraShutterLabel: 'AUFNAHME FÜR GOLEM VISION',
    cameraShutterCapturing: 'ERFASSE FRAME...',
    cameraUnavailablePrompt: 'KAMERA NICHT VERFÜGBAR · FOTO WÄHLEN',
    cameraSensorReady: 'OPTISCHE SENSOR-MATRIX // ARUCO 50 MM BEREIT',

    hudSearchingScale: 'SUCHE NACH MASSSTAB',
    hudScaleCandidate: 'MASSSTAB-KANDIDAT',
    hudRulerDetected: 'LINEAL ERKANNT',
    hudArucoDetected: 'ARUCO DETEKTIERT',
    hudScaleLocked: 'MASSSTAB FIXIERT',
    hudSearchingObject: 'SUCHE NACH OBJEKT',
    hudObjectCandidate: 'OBJEKT-KANDIDAT',
    hudObjectLocked: 'OBJEKT FIXIERT',
    hudHoldSteady: 'RUHIG HALTEN',
    hudMoveCloser: 'NÄHER HERANTRETEN',
    hudMoveFarther: 'WEITER ENTFERNEN',
    hudReduceAngle: 'KAMERAWINKEL VERRINGERN',
    hudMoreLight: 'MEHR LICHT ERFORDERLICH',
    hudObjectOccluded: 'OBJEKT VERDECKT',
    hudScaleLost: 'MASSSTAB VERLOREN',
    hudMeasurementVerified: 'MESSUNG VERIFIZIERT',
    hudLowConfidence: 'GERINGE GENAUIGKEIT',
    hudNeedAnotherView: 'ANDERE ANSICHT ERFORDERLICH',

    objectLockCandidate: 'OBJEKT-KANDIDAT',
    objectLockTapHint: 'Sucher antippen für Begrenzungsrahmen',
    objectLockSelected: 'RAHMEN AUSGEWÄHLT',
    objectLockLockBtn: 'FIXIEREN',
    objectLockUnlockBtn: 'LÖSEN',
    objectLockClearBtn: 'AUSWAHL LÖSCHEN',
    objectLockConfidence: 'GENAUIGKEIT',
    objectLockNotice: 'Objekt-Fixierungsschnittstelle (Vorbereitung für Server-Segmentierung)',

    captureTitle: 'OBJEKTERFASSUNG // PHOTOGRAMMETRIE',
    captureShellNotice: 'Orbitale Erfassungshülle. Rekonstruktion wartet auf Server-Engine (COLMAP/OpenMVS).',
    captureFrames: 'Bilder',
    captureCoverage: 'Abdeckung',
    captureAngleProgress: 'Winkel-Fortschritt',
    captureBlurWarning: 'WARNUNG: Bewegungsunschärfe! Gerät ruhig halten.',
    captureLightingWarning: 'WARNUNG: Unzureichende Ausleuchtung für Merkmalabgleich.',
    captureInsufficientCoverage: 'Ungenügende Blickwinkelabdeckung für 3D-Rekonstruktion (mind. 8 benötigt).',
    captureStartBtn: 'ERFASSUNG STARTEN',
    captureNextAngleBtn: 'WINKEL ERFASSEN',
    captureFinishBtn: 'ERFASSUNG BEENDEN',
    captureResetBtn: 'SERIE ZURÜCKSETZEN',
    captureDirectionLeft: 'NACH LINKS BEWEGEN',
    captureDirectionRight: 'NACH RECHTS BEWEGEN',
    captureDirectionUp: 'KAMERA ANHEBEN',
    captureDirectionDown: 'KAMERA SENKEN',
    captureDirectionHold: 'OBJEKT ZENTRIERT HALTEN',
    captureSectorFront: 'Vorne',
    captureSectorFrontRight: 'Vorne-Rechts',
    captureSectorRight: 'Rechts',
    captureSectorBackRight: 'Hinten-Rechts',
    captureSectorBack: 'Hinten',
    captureSectorBackLeft: 'Hinten-Links',
    captureSectorLeft: 'Links',
    captureSectorFrontLeft: 'Vorne-Links',
    captureSectorTop: 'Oben (optional)',

    drawingTitle: 'ZEICHNUNG / BAUPLAN ZU CAD',
    drawingReviewHeader: 'PARAMETRISCHE ZEICHNUNGSPRÜFUNG',
    drawingReviewSub: 'Extrahierte Maße vor Erzeugung des soliden CAD-Körpers',
    drawingUncertainNotice: 'Unsichere Maße dürfen nicht ohne Prüfung in CAD-Wahrheit überführt werden.',
    drawingTargetCad: 'CAD-Zielsystem:',
    drawingDimWidth: 'Breite (Width)',
    drawingDimHeight: 'Höhe (Height)',
    drawingDimHole: 'Bohrung (Hole Ø)',
    drawingDimOffsetX: 'Versatz X (Offset X)',
    drawingDimOffsetY: 'Versatz Y (Offset Y)',
    drawingActionConfirm: 'BESTÄTIGEN',
    drawingActionEdit: 'BEARBEITEN',
    drawingActionReject: 'ABLEHNEN',
    drawingSendCadBtn: 'AN CAD-PIPELINE SENDEN',
    drawingDiscardBtn: 'ZEICHNUNG VERWERFEN',

    badgeProcessing: 'VISION WIRD VERARBEITET',
    badgeVerified: 'VISION VERIFIZIERT',
    badgeApproximate: 'UNGEFÄHR',
    badgeReferenceOnly: 'REFERENZBILD',
    badgeNeedMoreInput: 'WEITERE EINGABE NÖTIG',
    badgeFailed: 'VISION FEHLGESCHLAGEN',
    visionDepthLimitation: 'Physische Tiefe in planarer Einzelansicht unbestätigt',
    visionArUcoScaleLabel: 'MASSSTAB: ARUCO 50 MM',
    attachedScanIngested: 'OPTISCHER SCAN GELADEN',
    removeAttachment: 'Anhang entfernen',

    quickSynthPrefix: 'SCHNELL-SYNTH:',
    inputPlaceholderNormal: '3D/CAD-Aufgabe beschreiben...',
    inputPlaceholderSynthesizing: 'Verifizierte 3D/CAD-Aufgabe läuft...',
    transmitBtnTitle: 'An GOLEM übertragen',
    operatorSender: 'OPERATOR',
    golemGuardian: 'GOLEM // WÄCHTER',
    bootMessage: 'GOLEM-Schnittstelle initialisiert. Konfigurieren Sie den Compute-Knoten im Menü oder senden Sie eine Anfrage.',
    attachedReferenceFallback: 'Analysiere die beigefügte Referenz ohne Erfindung nicht vorhandener Geometrie.',
    attachedVerifiedFallback: 'Verwende die verifizierten Kameramaße als Geometrie-Eingabe. Keine fehlende Tiefe erfinden.',

    drawerTagline: 'AUTONOMER 3D-SYNTHESE BEGLEITER',
    drawerTabVaults: 'TRESORE & SYSTEM',
    drawerTabHistory: 'SYNTHESE-HISTORIE',
    drawerSettingsSection: 'SYSTEM-LOKALISIERUNG',
    drawerStorageSection: 'SPEICHER- & DATENTRESORE',
    drawerCoreStatus: 'KERN ONLINE',
    drawerVersion: 'v2.4-LOCAL',
    drawerSearchPlaceholder: 'Synthetisierte Modelle filtern...',
    drawerReaccessBtn: 'IM CHAT ÖFFNEN',
    drawerInspectBtn: 'TELEMETRIE ANZEIGEN',
    drawerCollapseBtn: 'TELEMETRIE AUSBLENDEN',
    drawerCopyJsonBtn: 'ASSET-JSON KOPIEREN',
    drawerCopiedJson: 'JSON KOPIERT',
    drawerEmptyHistory: 'Keine Modelle vorhanden.',
    drawerTotalAssets: 'Erfasste 3D-Assets',
    drawerShareBtn: 'TEILEN',
    drawerCopiedLink: 'LINK KOPIERT',
    drawerComparatorBtn: 'SYNTHESE-KOMPARATOR // 3D DIFF',
    drawerCompareSingleBtn: 'VERGLEICHEN',
    drawerTelemetryLink: 'STRUKTURIERTER TELEMETRIE-LINK',
    drawerDiagnosticsSection: 'SESSION-DIAGNOSE & LOGS',
    drawerDownloadLogBtn: 'DIAGNOSE-LOG HERUNTERLADEN',
    drawerDownloadingLog: 'LOG HERUNTERGELADEN',
    drawerLogSubtitle: 'Strukturierte Telemetrie der Synthese-Aktivität, Geometrie-Metadaten & Zeitstempel.',
    drawerLogAssets: 'Erfasste Assets',
    drawerLogPolygons: 'Gesamtpolygone',
    drawerQuickLogBtn: 'SESSION-LOG EXPORTIEREN',

    projectsTitle: 'CAD-PROJEKT-BROWSER',
    projectsSubTitle: 'AUTORITATIVE VERSIONEN & ARTEFAKTE',
    projectsEmpty: 'Keine CAD-Projekte im Speicher gefunden.',
    projectsSelectPrompt: 'Wählen Sie links ein Projekt, um Artefakte und Versionshistorie einzusehen.',
    projectsVersionHeader: 'PROJEKTVERSION',
    projectsArtifactsHeader: 'VERSIONS-ARTEFAKTE',
    projectsModifyTitle: 'PARAMETRISCHES MODELL MODIFIZIEREN',
    projectsModifyPlaceholder: 'Anweisungen zur Geometrieanpassung...',
    projectsModifyBtn: 'ÄNDERUNG ANWENDEN',
    projectsModifying: 'Erzeuge modifizierte Version...',
    projectsDownloadBtn: 'Herunterladen',
    projectsRefreshBtn: 'Liste aktualisieren',
    projectsCloseBtn: 'Browser schließen',

    snackLangSwitched: 'Sprache gewechselt zu: DEUTSCH',
    snackModelReaccessed: '3D-Modell geladen:',
    snackComparatorOpened: 'Komparator für Modellvergleich geöffnet',
    snackLogDownloaded: 'Diagnose-Log heruntergeladen:',
    snackVisionAnalyzing: 'Bild angehängt · GOLEM Vision prüft ArUco-Metrik...',
    snackVisionVerified: 'VISION VERIFIZIERT · ArUco 50 mm',
    snackVisionReference: 'Als Referenz angehängt · kein ArUco-Marker erkannt.',
    snackFileAttached: 'Datei angehängt:',
    close: 'Schließen',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    retry: 'Wiederholen',

    checkingAruco: 'GOLEM Vision prüft ArUco-Metrikebene...',
    imageTooLarge: 'Bild ist zu groß; maximal 12 MB.',
    tagline: 'AUTONOMER 3D-SYNTHESE BEGLEITER',
    neuralMeshBusy: 'NEURALES GITTERNETZ AUSGELASTET',
    neuralLatticeOnline: 'NEURALES GITTER ONLINE',
    headerProjects: 'PROJEKTE',
    headerComparator: '3D-KOMPARATOR',
    headerSimulation: 'Simulation',
    headerSplitView: 'Geteilte Ansicht',
    headerRuntime: 'Laufzeit',
    statusSyncOnline: 'SYNC // ONLINE',
    addPeripheralTitle: 'Foto / Datei / Kamera hinzufügen',
    executing3DTask: 'Geprüfte 3D/CAD-Aufgabe wird ausgeführt...',
    describe3DTask: 'Beschreiben Sie eine 3D/CAD-Aufgabe...',
    synthesisInProgress: 'Synthese läuft',
    transmitToGolem: 'An GOLEM übertragen',
  },
};

export function getInitialLanguage(): AppLanguage {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as AppLanguage | null;
    if (saved && (saved === 'ru' || saved === 'en' || saved === 'de')) {
      return saved;
    }
  } catch {
    // LocalStorage might be inaccessible in certain iframe restrictions
  }
  return 'ru'; // Default to Russian as per project profile, easily switchable to EN/DE
}

interface I18nContextValue {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: TranslationDictionary;
}

const I18nContext = createContext<I18nContextValue>({
  language: 'ru',
  setLanguage: () => {},
  t: translations.ru,
});

export const I18nProvider: React.FC<{ children: ReactNode; initialLang?: AppLanguage }> = ({
  children,
  initialLang,
}) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => initialLang || getInitialLanguage());

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const value: I18nContextValue = {
    language,
    setLanguage,
    t: translations[language] || translations.en,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
