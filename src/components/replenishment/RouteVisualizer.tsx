'use client';

import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Group, Line, Circle, Arrow } from 'react-konva';
import { StoreZone, ShelfUnit, ReplenishmentRoute } from '@/types';

// ---------------------------------------------------------------------------
// RouteVisualizer — Konva canvas showing optimized replenishment route
// ---------------------------------------------------------------------------
interface RouteVisualizerProps {
  zones: StoreZone[];
  shelves: ShelfUnit[];
  route: ReplenishmentRoute;
  completedTasks: Set<string>;
  storeDimensions: { width: number; height: number };
  backroomPosition: { x: number; y: number };
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDING = 30;

export default function RouteVisualizer({
  zones,
  shelves,
  route,
  completedTasks,
  storeDimensions,
  backroomPosition,
}: RouteVisualizerProps) {
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

  // Build the route path points
  const shelfMap = new Map(shelves.map((s) => [s.id, s]));
  const routeStops = route.directions.map((dir) => {
    const shelf = shelves.find((s) => s.code === dir.targetShelf);
    return shelf
      ? { x: PADDING + shelf.position.x * scaleX + (shelf.dimensions.width * scaleX) / 2, y: PADDING + shelf.position.y * scaleY + (shelf.dimensions.height * scaleY) / 2 }
      : { x: 0, y: 0 };
  });

  // Add backroom as starting point
  const backroomCanvasPos = {
    x: PADDING + backroomPosition.x * scaleX,
    y: PADDING + backroomPosition.y * scaleY,
  };

  const allStops = [backroomCanvasPos, ...routeStops];

  // Build the line points array
  const linePoints: number[] = [];
  allStops.forEach((stop) => {
    linePoints.push(stop.x, stop.y);
  });

  return (
    <div ref={containerRef} className="glass-card overflow-hidden">
      <Stage width={canvasSize.width} height={canvasSize.height}>
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

        {/* Zones (dimmed) */}
        <Layer>
          {zones.map((zone) => (
            <Rect
              key={zone.id}
              x={PADDING + zone.bounds.x * scaleX}
              y={PADDING + zone.bounds.y * scaleY}
              width={zone.bounds.width * scaleX}
              height={zone.bounds.height * scaleY}
              fill={`${zone.color}06`}
              stroke={`${zone.color}20`}
              strokeWidth={1}
              cornerRadius={4}
              dash={[6, 4]}
            />
          ))}
        </Layer>

        {/* Shelves (dimmed) */}
        <Layer>
          {shelves.map((shelf) => {
            const zone = zones.find((z) => z.id === shelf.zoneId);
            return (
              <Rect
                key={shelf.id}
                x={PADDING + shelf.position.x * scaleX}
                y={PADDING + shelf.position.y * scaleY}
                width={shelf.dimensions.width * scaleX}
                height={shelf.dimensions.height * scaleY}
                fill={zone?.color || '#3b82f6'}
                opacity={0.15}
                cornerRadius={3}
              />
            );
          })}
        </Layer>

        {/* Route Path */}
        <Layer>
          {/* Animated route line */}
          <Line
            points={linePoints}
            stroke="#06b6d4"
            strokeWidth={2.5}
            dash={[8, 4]}
            opacity={0.8}
            lineCap="round"
            lineJoin="round"
          />

          {/* Route arrows between stops */}
          {allStops.slice(0, -1).map((from, idx) => {
            const to = allStops[idx + 1];
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            // Place arrow at midpoint
            const midX = from.x + dx * 0.5;
            const midY = from.y + dy * 0.5;

            return (
              <Group key={`arrow-${idx}`}>
                <Arrow
                  points={[from.x + dx * 0.3, from.y + dy * 0.3, from.x + dx * 0.7, from.y + dy * 0.7]}
                  stroke="#06b6d480"
                  fill="#06b6d480"
                  strokeWidth={1.5}
                  pointerLength={6}
                  pointerWidth={5}
                />
              </Group>
            );
          })}

          {/* Backroom start marker */}
          <Group>
            <Circle
              x={backroomCanvasPos.x}
              y={backroomCanvasPos.y}
              radius={12}
              fill="#10b981"
              opacity={0.9}
              shadowBlur={10}
              shadowColor="#10b981"
              shadowOpacity={0.5}
            />
            <Text
              x={backroomCanvasPos.x - 4}
              y={backroomCanvasPos.y - 5}
              text="S"
              fontSize={10}
              fill="white"
              fontFamily="Inter"
              fontStyle="bold"
            />
            <Text
              x={backroomCanvasPos.x - 22}
              y={backroomCanvasPos.y + 16}
              text="START"
              fontSize={8}
              fill="#10b981"
              fontFamily="Inter"
              fontStyle="bold"
              letterSpacing={1}
            />
          </Group>

          {/* Route stop markers (numbered) */}
          {routeStops.map((stop, idx) => {
            const taskId = route.sequence[idx];
            const isCompleted = completedTasks.has(taskId);

            return (
              <Group key={`stop-${idx}`}>
                <Circle
                  x={stop.x}
                  y={stop.y}
                  radius={10}
                  fill={isCompleted ? '#10b981' : '#06b6d4'}
                  opacity={0.9}
                  shadowBlur={8}
                  shadowColor={isCompleted ? '#10b981' : '#06b6d4'}
                  shadowOpacity={0.4}
                />
                <Text
                  x={stop.x - (idx + 1 >= 10 ? 6 : 3)}
                  y={stop.y - 5}
                  text={isCompleted ? '✓' : `${idx + 1}`}
                  fontSize={9}
                  fill="white"
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
