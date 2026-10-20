'use client';

import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Line } from 'react-konva';
import { StoreZone, ShelfUnit } from '@/types';

// ---------------------------------------------------------------------------
// StoreCanvas — Main Konva Stage rendering the store floor plan
// ---------------------------------------------------------------------------
interface StoreCanvasProps {
  zones: StoreZone[];
  shelves: ShelfUnit[];
  selectedShelfId: string | null;
  heatmapEnabled: boolean;
  showLabels: boolean;
  onShelfClick: (shelf: ShelfUnit) => void;
  storeDimensions: { width: number; height: number };
}

/** Convert fill percentage to heatmap color */
function getHeatmapColor(fillPct: number): string {
  if (fillPct >= 70) return '#22c55e';  // green — healthy
  if (fillPct >= 40) return '#eab308';  // yellow — moderate
  if (fillPct >= 20) return '#f97316';  // orange — low
  return '#ef4444';                      // red — critical
}

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 680;
const PADDING = 30;

export default function StoreCanvas({
  zones,
  shelves,
  selectedShelfId,
  heatmapEnabled,
  showLabels,
  onShelfClick,
  storeDimensions,
}: StoreCanvasProps) {
  const [hoveredShelf, setHoveredShelf] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

  // Responsive canvas sizing
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

  // Scale factor: store meters → canvas pixels
  const scaleX = (canvasSize.width - PADDING * 2) / storeDimensions.width;
  const scaleY = (canvasSize.height - PADDING * 2) / storeDimensions.height;

  return (
    <div ref={containerRef} className="glass-card overflow-hidden">
      <Stage width={canvasSize.width} height={canvasSize.height}>
        {/* --- Background Layer --- */}
        <Layer>
          {/* Store floor background */}
          <Rect
            x={0} y={0}
            width={canvasSize.width}
            height={canvasSize.height}
            fill="#f7fafb"
          />

          {/* Store boundary */}
          <Rect
            x={PADDING}
            y={PADDING}
            width={canvasSize.width - PADDING * 2}
            height={canvasSize.height - PADDING * 2}
            stroke="#d7e2e4"
            strokeWidth={2}
            cornerRadius={8}
            fill="#ffffff"
          />

          {/* Backroom indicator */}
          <Rect
            x={canvasSize.width / 2 - 60}
            y={canvasSize.height - PADDING - 3}
            width={120}
            height={6}
            fill="#0c9187"
            cornerRadius={3}
          />
          <Text
            x={canvasSize.width / 2 - 40}
            y={canvasSize.height - PADDING + 8}
            text="⬆ BACKROOM"
            fontSize={9}
            fill="#718792"
            fontFamily="Inter"
            fontStyle="bold"
            letterSpacing={1}
          />

          {/* Entrance indicator */}
          <Rect
            x={canvasSize.width / 2 - 40}
            y={PADDING - 3}
            width={80}
            height={6}
            fill="#148a68"
            cornerRadius={3}
          />
          <Text
            x={canvasSize.width / 2 - 28}
            y={PADDING - 18}
            text="ENTRANCE"
            fontSize={9}
            fill="#718792"
            fontFamily="Inter"
            fontStyle="bold"
            letterSpacing={1}
          />
        </Layer>

        {/* --- Zones Layer --- */}
        <Layer>
          {zones.map((zone) => {
            const x = PADDING + zone.bounds.x * scaleX;
            const y = PADDING + zone.bounds.y * scaleY;
            const w = zone.bounds.width * scaleX;
            const h = zone.bounds.height * scaleY;

            return (
              <Group key={zone.id}>
                <Rect
                  x={x} y={y}
                  width={w} height={h}
                  fill={`${zone.color}08`}
                  stroke={`${zone.color}30`}
                  strokeWidth={1}
                  cornerRadius={6}
                  dash={[6, 4]}
                />
                {showLabels && (
                  <Text
                    x={x + 8}
                    y={y + 6}
                    text={zone.name.toUpperCase()}
                    fontSize={10}
                    fill={`${zone.color}90`}
                    fontFamily="Inter"
                    fontStyle="bold"
                    letterSpacing={1.5}
                  />
                )}
              </Group>
            );
          })}
        </Layer>

        {/* --- Aisle Lines --- */}
        <Layer>
          {/* Horizontal aisles */}
          <Line
            points={[PADDING + 1 * scaleX, PADDING + 14.5 * scaleY, PADDING + 39 * scaleX, PADDING + 14.5 * scaleY]}
            stroke="#d7e2e480"
            strokeWidth={1}
            dash={[8, 4]}
          />
          {/* Vertical aisles */}
          <Line
            points={[PADDING + 13 * scaleX, PADDING + 1 * scaleY, PADDING + 13 * scaleX, PADDING + 29 * scaleY]}
            stroke="#d7e2e480"
            strokeWidth={1}
            dash={[8, 4]}
          />
          <Line
            points={[PADDING + 26 * scaleX, PADDING + 1 * scaleY, PADDING + 26 * scaleX, PADDING + 29 * scaleY]}
            stroke="#d7e2e480"
            strokeWidth={1}
            dash={[8, 4]}
          />
        </Layer>

        {/* --- Shelves Layer --- */}
        <Layer>
          {shelves.map((shelf) => {
            const zone = zones.find((z) => z.id === shelf.zoneId);
            const x = PADDING + shelf.position.x * scaleX;
            const y = PADDING + shelf.position.y * scaleY;
            const w = shelf.dimensions.width * scaleX;
            const h = shelf.dimensions.height * scaleY;
            const isSelected = shelf.id === selectedShelfId;
            const isHovered = shelf.id === hoveredShelf;

            // Determine shelf fill color
            let fillColor: string;
            if (heatmapEnabled) {
              fillColor = getHeatmapColor(shelf.fillPercentage);
            } else {
              fillColor = zone?.color || '#3b82f6';
            }

            const opacity = heatmapEnabled
              ? 0.62
              : isSelected ? 0.72 : isHovered ? 0.5 : 0.28;

            return (
              <Group
                key={shelf.id}
                onClick={() => onShelfClick(shelf)}
                onTap={() => onShelfClick(shelf)}
                onMouseEnter={() => {
                  setHoveredShelf(shelf.id);
                  document.body.style.cursor = 'pointer';
                }}
                onMouseLeave={() => {
                  setHoveredShelf(null);
                  document.body.style.cursor = 'default';
                }}
              >
                {/* Shelf body */}
                <Rect
                  x={x} y={y}
                  width={w} height={h}
                  fill={fillColor}
                  opacity={opacity}
                  stroke={isSelected ? '#0c9187' : isHovered ? '#8aaeb0' : 'transparent'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  cornerRadius={4}
                  shadowBlur={isSelected ? 12 : isHovered ? 8 : 0}
                  shadowColor={isSelected ? '#0c9187' : fillColor}
                  shadowOpacity={0.4}
                />

                {/* Fill percentage indicator bar */}
                <Rect
                  x={x}
                  y={y + h - 3}
                  width={w * (shelf.fillPercentage / 100)}
                  height={3}
                  fill={shelf.fillPercentage > 50 ? '#10b981' : shelf.fillPercentage > 20 ? '#f59e0b' : '#ef4444'}
                  cornerRadius={[0, 0, 4, 4]}
                  opacity={0.8}
                />

                {/* Shelf code label */}
                {showLabels && (
                  <Text
                    x={x + 4}
                    y={y + 4}
                    text={shelf.code}
                    fontSize={Math.min(10, w / 4)}
                    fill={isSelected ? '#075f5a' : '#243b45'}
                    fontFamily="Inter"
                    fontStyle="bold"
                  />
                )}

                {/* Fill percentage on hover */}
                {(isHovered || isSelected) && (
                  <Text
                    x={x + w - 28}
                    y={y + 4}
                    text={`${shelf.fillPercentage}%`}
                    fontSize={9}
                    fill="#243b45"
                    fontFamily="Inter"
                    fontStyle="600"
                  />
                )}
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
