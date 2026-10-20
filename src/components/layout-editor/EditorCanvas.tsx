'use client';

import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Line } from 'react-konva';
import { StoreZone, ShelfUnit } from '@/types';

// ---------------------------------------------------------------------------
// EditorCanvas — Drag-and-drop Konva canvas for shelf arrangement
// ---------------------------------------------------------------------------
interface EditorCanvasProps {
  zones: StoreZone[];
  shelves: ShelfUnit[];
  selectedShelfId: string | null;
  snapToGrid: boolean;
  storeDimensions: { width: number; height: number };
  onShelfSelect: (shelfId: string | null) => void;
  onShelfMove: (shelfId: string, newPos: { x: number; y: number }) => void;
}

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 680;
const PADDING = 30;
const GRID_STEP_METERS = 1; // 1-meter grid

export default function EditorCanvas({
  zones,
  shelves,
  selectedShelfId,
  snapToGrid,
  storeDimensions,
  onShelfSelect,
  onShelfMove,
}: EditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        const aspect = CANVAS_HEIGHT / CANVAS_WIDTH;
        setCanvasSize({ width: w, height: w * aspect });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const scaleX = (canvasSize.width - PADDING * 2) / storeDimensions.width;
  const scaleY = (canvasSize.height - PADDING * 2) / storeDimensions.height;

  // Generate grid lines
  const gridLines: { points: number[] }[] = [];
  if (snapToGrid) {
    for (let x = 0; x <= storeDimensions.width; x += GRID_STEP_METERS) {
      gridLines.push({
        points: [
          PADDING + x * scaleX, PADDING,
          PADDING + x * scaleX, canvasSize.height - PADDING,
        ],
      });
    }
    for (let y = 0; y <= storeDimensions.height; y += GRID_STEP_METERS) {
      gridLines.push({
        points: [
          PADDING, PADDING + y * scaleY,
          canvasSize.width - PADDING, PADDING + y * scaleY,
        ],
      });
    }
  }

  const handleDragEnd = (shelfId: string, e: { target: { x: () => number; y: () => number } }) => {
    const canvasX = e.target.x();
    const canvasY = e.target.y();
    // Convert back to store coordinates (meters)
    const storeX = (canvasX - PADDING) / scaleX;
    const storeY = (canvasY - PADDING) / scaleY;
    // Clamp within store bounds
    const clampedX = Math.max(0, Math.min(storeX, storeDimensions.width - 3));
    const clampedY = Math.max(0, Math.min(storeY, storeDimensions.height - 1.2));
    onShelfMove(shelfId, { x: clampedX, y: clampedY });
  };

  const handleStageClick = (e: { target: { getStage: () => unknown } }) => {
    // If clicking on the stage background, deselect
    if (e.target === e.target.getStage()) {
      onShelfSelect(null);
    }
  };

  return (
    <div ref={containerRef} className="glass-card overflow-hidden">
      <Stage
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleStageClick}
      >
        {/* Background */}
        <Layer>
          <Rect x={0} y={0} width={canvasSize.width} height={canvasSize.height} fill="#0d1221" />
          <Rect
            x={PADDING} y={PADDING}
            width={canvasSize.width - PADDING * 2}
            height={canvasSize.height - PADDING * 2}
            stroke="#2a3150"
            strokeWidth={2}
            cornerRadius={8}
            fill="#111827"
          />
        </Layer>

        {/* Grid Layer */}
        {snapToGrid && (
          <Layer>
            {gridLines.map((line, idx) => (
              <Line
                key={`grid-${idx}`}
                points={line.points}
                stroke="#1e254020"
                strokeWidth={0.5}
              />
            ))}
          </Layer>
        )}

        {/* Zones */}
        <Layer>
          {zones.map((zone) => (
            <Group key={zone.id}>
              <Rect
                x={PADDING + zone.bounds.x * scaleX}
                y={PADDING + zone.bounds.y * scaleY}
                width={zone.bounds.width * scaleX}
                height={zone.bounds.height * scaleY}
                fill={`${zone.color}08`}
                stroke={`${zone.color}25`}
                strokeWidth={1}
                cornerRadius={4}
                dash={[6, 4]}
              />
              <Text
                x={PADDING + zone.bounds.x * scaleX + 8}
                y={PADDING + zone.bounds.y * scaleY + 6}
                text={zone.name.toUpperCase()}
                fontSize={10}
                fill={`${zone.color}80`}
                fontFamily="Inter"
                fontStyle="bold"
                letterSpacing={1.5}
              />
            </Group>
          ))}
        </Layer>

        {/* Draggable Shelves */}
        <Layer>
          {shelves.map((shelf) => {
            const zone = zones.find((z) => z.id === shelf.zoneId);
            const isSelected = shelf.id === selectedShelfId;
            const x = PADDING + shelf.position.x * scaleX;
            const y = PADDING + shelf.position.y * scaleY;
            const w = shelf.dimensions.width * scaleX;
            const h = shelf.dimensions.height * scaleY;

            return (
              <Group
                key={shelf.id}
                x={x}
                y={y}
                draggable
                onClick={(e) => {
                  e.cancelBubble = true;
                  onShelfSelect(shelf.id);
                }}
                onDragEnd={(e) => handleDragEnd(shelf.id, e)}
                onMouseEnter={() => {
                  document.body.style.cursor = 'grab';
                }}
                onMouseLeave={() => {
                  document.body.style.cursor = 'default';
                }}
                onDragStart={() => {
                  document.body.style.cursor = 'grabbing';
                  onShelfSelect(shelf.id);
                }}
              >
                {/* Selection highlight */}
                {isSelected && (
                  <Rect
                    x={-3} y={-3}
                    width={w + 6} height={h + 6}
                    stroke="#06b6d4"
                    strokeWidth={2}
                    cornerRadius={6}
                    dash={[4, 3]}
                    fill="transparent"
                    shadowBlur={12}
                    shadowColor="#06b6d4"
                    shadowOpacity={0.3}
                  />
                )}

                {/* Shelf body */}
                <Rect
                  x={0} y={0}
                  width={w} height={h}
                  fill={zone?.color || '#3b82f6'}
                  opacity={isSelected ? 0.85 : 0.55}
                  cornerRadius={4}
                  strokeWidth={isSelected ? 0 : 1}
                  stroke={isSelected ? '' : `${zone?.color}40`}
                />

                {/* Shelf code */}
                <Text
                  x={4} y={3}
                  text={shelf.code}
                  fontSize={Math.min(10, w / 4)}
                  fill="#ffffff"
                  fontFamily="Inter"
                  fontStyle="bold"
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
