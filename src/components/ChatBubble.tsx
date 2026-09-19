import React from 'react';
import { ChatMessage } from '../types';
import { ModelViewer3D } from './ModelViewer3D';
import { SynthesisProgressBar } from './SynthesisProgressBar';
import { Bot, User, Sparkles } from 'lucide-react';

interface ChatBubbleProps {
  message: ChatMessage;
  onOpenComparator?: (messageId: string) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onOpenComparator }) => {
  const isGolem = message.sender === 'golem';

  return (
    <div
      id={`chat-msg-${message.id}`}
      className={`flex items-start gap-2.5 my-3 px-3 w-full transition-all duration-300 ${
        isGolem ? 'justify-start' : 'justify-end'
      }`}
    >
      {/* GOLEM Avatar */}
      {isGolem && (
        <div className="shrink-0 relative">
          <div className="w-8 h-8 rounded-none clip-faceted-sm bg-slate-900 border border-cyan-400/80 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
            <Bot className="w-4 h-4" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black" />
        </div>
      )}

      {/* Message Body */}
      <div
        className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${
          isGolem ? 'items-start' : 'items-end'
        }`}
      >
        {/* Meta Header */}
        <div className="flex items-center gap-2 mb-1 px-1 text-[11px] font-mono">
          <span
            className={`font-semibold tracking-wider ${
              isGolem ? 'text-cyan-400' : 'text-sky-300'
            }`}
          >
            {isGolem ? 'GOLEM // GUARDIAN' : 'OPERATOR'}
          </span>
          <span className="text-slate-500 text-[10px]">{message.timestamp}</span>
          {isGolem && message.source && (
            <span className={`text-[8px] px-1 py-0.5 border font-mono ${
              message.source === 'local_llm_grounded'
                ? 'text-violet-300 border-violet-500/40 bg-violet-950/30'
                : message.source === 'local_llm'
                ? 'text-cyan-300 border-cyan-500/30'
                : 'text-emerald-300 border-emerald-500/30'
            }`}>
              {message.source === 'local_llm_grounded'
                ? 'LOCAL LLM + CANONICAL FACTS'
                : message.source === 'local_llm'
                ? 'LOCAL LLM'
                : message.source.toUpperCase()}
            </span>
          )}
        </div>

        {/* Attached Photo preview */}
        {message.attachedImage && (
          <div className="mb-2 p-1 bg-slate-900 border border-cyan-500/50 clip-faceted-sm shadow-md">
            <img
              src={message.attachedImage}
              alt="Scan capture"
              className="max-h-44 rounded-none object-cover border border-cyan-500/30"
            />
            <div className="px-2 py-1 text-[10px] font-mono text-cyan-300 flex items-center justify-between">
              <span>ATTACHED_HUD_SCAN.JPG</span>
              <span className="text-emerald-400">INGESTED</span>
            </div>
          </div>
        )}

        {/* Real-time Synthesis Progress Bar Bubble */}
        {message.isSynthesizing && message.synthesisProgress ? (
          <div className="w-full min-w-[280px] sm:min-w-[320px] max-w-[360px]">
            <SynthesisProgressBar 
              progressData={message.synthesisProgress} 
              promptSnippet={message.text}
            />
          </div>
        ) : message.is3DModel ? (
          <div>
            <ModelViewer3D
              modelName={message.modelDetails?.name}
              modelUrl={message.modelAsset?.glbUrl}
              downloadUrl={message.modelAsset?.downloadUrl}
              provider={message.modelAsset?.provider}
              sha256={message.modelAsset?.sha256}
              effectStatus={message.modelAsset?.effectStatus}
              vertices={message.modelDetails?.vertices}
              polygons={message.modelDetails?.polygons}
              renderTime={message.modelDetails?.renderTime}
              fileSize={message.modelDetails?.fileSize}
              textureComplexity={message.modelDetails?.textureComplexity}
              meshDensity={message.modelDetails?.meshDensity}
              dimensions={message.modelDetails?.dimensions}
              uvChannels={message.modelDetails?.uvChannels}
              drawCalls={message.modelDetails?.drawCalls}
              materialCount={message.modelDetails?.materialCount}
              dracoCompression={message.modelDetails?.dracoCompression}
              characterName={message.modelDetails?.characterName}
              species={message.modelDetails?.species}
              profileId={message.modelDetails?.profileId}
              variantOf={message.modelDetails?.variantOf}
              modifiers={message.modelDetails?.modifiers}
              modularParts={message.modelDetails?.modularParts}
              tailSegments={message.modelDetails?.tailSegments}
              backSpines={message.modelDetails?.backSpines}
              rigPresent={message.modelDetails?.rigPresent}
              onOpenComparator={onOpenComparator ? () => onOpenComparator(message.id) : undefined}
            />
            {message.text && (
              <p className="mt-1 text-xs text-slate-300 bg-slate-900/90 border border-cyan-500/30 px-3 py-2 clip-faceted-sm">
                {message.text}
              </p>
            )}
          </div>
        ) : (
          <div
            className={`relative px-3.5 py-2.5 text-sm leading-relaxed transition-all ${
              isGolem
                ? 'bg-slate-950/90 border border-cyan-400/60 clip-faceted-sm text-slate-100 shadow-[0_0_15px_rgba(0,240,255,0.08)]'
                : 'bg-slate-800/90 border border-slate-700 clip-faceted-sm text-white'
            }`}
          >
            {/* Subtle decorative crystalline corner accent for GOLEM */}
            {isGolem && (
              <>
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-300" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-300" />
              </>
            )}
            <p className="whitespace-pre-wrap select-text">{message.text}</p>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isGolem && (
        <div className="shrink-0 relative">
          <div className="w-8 h-8 rounded-none clip-faceted-sm bg-slate-800 border border-slate-600 flex items-center justify-center text-sky-300">
            <User className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
};
