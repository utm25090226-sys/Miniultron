import { motion } from "motion/react";
import { RobotStats } from "../types/game";
import { CLOTHING_ITEMS } from "../types/game";

interface RobotDisplayProps {
  stats: RobotStats;
  isHappy?: boolean;
}

export function RobotDisplay({ stats, isHappy = false }: RobotDisplayProps) {
  // Obtener prendas equipadas
  const equippedClothing = stats.clothing.map(id =>
    CLOTHING_ITEMS.find(item => item.id === id)
  ).filter(Boolean);

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="relative"
        animate={{
          y: isHappy ? [0, -15, 0] : [0, -8, 0],
        }}
        transition={{
          duration: isHappy ? 0.6 : 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Cuerpo del robot moderno */}
        <svg width="240" height="280" viewBox="0 0 240 280" className="drop-shadow-2xl">
          {/* Antenas duales */}
          <g>
            <line x1="90" y1="45" x2="80" y2="15" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            <circle cx="77" cy="10" r="7" fill="#3b82f6">
              <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <line x1="150" y1="45" x2="160" y2="15" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            <circle cx="163" cy="10" r="7" fill="#3b82f6">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Glow effect detrás de la cabeza */}
          <ellipse cx="120" cy="85" rx="65" ry="60" fill="#3b82f6" opacity="0.1" />

          {/* Cabeza principal - diseño más moderno */}
          <defs>
            <linearGradient id="headGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <filter id="innerShadow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.5"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Cabeza mejorada */}
          <rect
            x="60"
            y="45"
            width="120"
            height="90"
            rx="25"
            fill="url(#headGradient)"
            stroke="#1e40af"
            strokeWidth="4"
          />

          {/* Visor/Pantalla frontal */}
          <rect
            x="70"
            y="60"
            width="100"
            height="50"
            rx="10"
            fill="#0f172a"
            opacity="0.8"
          />

          {/* Ojos modernos con efecto LED */}
          <g>
            {/* Ojo izquierdo */}
            <ellipse cx="95" cy="85" rx="15" ry="12" fill="#06b6d4">
              <animate attributeName="ry" values="12;2;12" dur="4s" repeatCount="indefinite" />
            </ellipse>
            <circle cx="95" cy="85" r="8" fill="#67e8f9">
              <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="92" cy="82" r="3" fill="#ffffff" />

            {/* Ojo derecho */}
            <ellipse cx="145" cy="85" rx="15" ry="12" fill="#06b6d4">
              <animate attributeName="ry" values="12;2;12" dur="4s" repeatCount="indefinite" />
            </ellipse>
            <circle cx="145" cy="85" r="8" fill="#67e8f9">
              <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="142" cy="82" r="3" fill="#ffffff" />
          </g>

          {/* Detalles tecnológicos en la cabeza */}
          <g opacity="0.6">
            <line x1="75" y1="70" x2="85" y2="70" stroke="#06b6d4" strokeWidth="2" />
            <line x1="155" y1="70" x2="165" y2="70" stroke="#06b6d4" strokeWidth="2" />
            <circle cx="75" cy="95" r="2" fill="#06b6d4">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="165" cy="95" r="2" fill="#06b6d4">
              <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Boca/Speaker */}
          {isHappy ? (
            <path
              d="M 100 105 Q 120 115 140 105"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ) : (
            <g>
              <rect x="100" y="105" width="8" height="2" fill="#06b6d4" opacity="0.8" />
              <rect x="112" y="105" width="8" height="2" fill="#06b6d4" opacity="0.8" />
              <rect x="124" y="105" width="8" height="2" fill="#06b6d4" opacity="0.8" />
            </g>
          )}

          {/* Cuello */}
          <rect
            x="100"
            y="135"
            width="40"
            height="15"
            rx="5"
            fill="url(#bodyGradient)"
            stroke="#1e40af"
            strokeWidth="3"
          />

          {/* Cuerpo principal más detallado */}
          <rect
            x="50"
            y="150"
            width="140"
            height="85"
            rx="15"
            fill="url(#bodyGradient)"
            stroke="#1e40af"
            strokeWidth="4"
          />

          {/* Panel de control central */}
          <g>
            <rect
              x="80"
              y="165"
              width="80"
              height="55"
              rx="8"
              fill="#0f172a"
              opacity="0.5"
            />

            {/* Indicadores LED */}
            <circle cx="95" cy="185" r="4" fill="#22c55e">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="120" cy="185" r="4" fill="#3b82f6">
              <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="145" cy="185" r="4" fill="#f59e0b">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
            </circle>

            {/* Pantalla de datos */}
            <rect x="85" y="195" width="70" height="3" fill="#06b6d4" opacity="0.6" />
            <rect x="85" y="200" width="50" height="3" fill="#06b6d4" opacity="0.4" />
            <rect x="85" y="205" width="60" height="3" fill="#06b6d4" opacity="0.5" />
          </g>

          {/* Detalles laterales del cuerpo */}
          <g>
            <circle cx="60" cy="180" r="5" fill="#0f172a" opacity="0.3" />
            <circle cx="180" cy="180" r="5" fill="#0f172a" opacity="0.3" />
            <line x1="55" y1="200" x2="65" y2="200" stroke="#1e40af" strokeWidth="2" />
            <line x1="175" y1="200" x2="185" y2="200" stroke="#1e40af" strokeWidth="2" />
          </g>

          {/* Brazos articulados */}
          <g>
            {/* Brazo izquierdo */}
            <rect
              x="25"
              y="160"
              width="20"
              height="50"
              rx="10"
              fill="url(#bodyGradient)"
              stroke="#1e40af"
              strokeWidth="3"
            />
            <circle cx="35" cy="165" r="4" fill="#0f172a" opacity="0.3" />
            <line x1="30" y1="185" x2="40" y2="185" stroke="#1e40af" strokeWidth="2" />

            {/* Brazo derecho */}
            <rect
              x="195"
              y="160"
              width="20"
              height="50"
              rx="10"
              fill="url(#bodyGradient)"
              stroke="#1e40af"
              strokeWidth="3"
            />
            <circle cx="205" cy="165" r="4" fill="#0f172a" opacity="0.3" />
            <line x1="200" y1="185" x2="210" y2="185" stroke="#1e40af" strokeWidth="2" />
          </g>

          {/* Manos/Pinzas */}
          <g>
            <ellipse cx="35" cy="215" rx="10" ry="8" fill="#2563eb" stroke="#1e40af" strokeWidth="2" />
            <ellipse cx="205" cy="215" rx="10" ry="8" fill="#2563eb" stroke="#1e40af" strokeWidth="2" />
          </g>

          {/* Base/Piernas */}
          <g>
            {/* Pierna izquierda */}
            <rect
              x="70"
              y="235"
              width="35"
              height="30"
              rx="8"
              fill="url(#bodyGradient)"
              stroke="#1e40af"
              strokeWidth="3"
            />
            <rect x="72" y="260" width="31" height="8" rx="4" fill="#1e40af" />

            {/* Pierna derecha */}
            <rect
              x="135"
              y="235"
              width="35"
              height="30"
              rx="8"
              fill="url(#bodyGradient)"
              stroke="#1e40af"
              strokeWidth="3"
            />
            <rect x="137" y="260" width="31" height="8" rx="4" fill="#1e40af" />
          </g>

          {/* Detalles adicionales en piernas */}
          <g opacity="0.6">
            <circle cx="87" cy="245" r="3" fill="#06b6d4" />
            <circle cx="152" cy="245" r="3" fill="#06b6d4" />
          </g>

          {/* Efecto de energía/aura */}
          <g opacity="0.2">
            <ellipse cx="120" cy="180" rx="80" ry="70">
              <animate attributeName="rx" values="80;85;80" dur="3s" repeatCount="indefinite" />
              <animate attributeName="ry" values="70;75;70" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite" />
            </ellipse>
          </g>
        </svg>

        {/* Prendas equipadas como emojis flotantes */}
        <div className="absolute inset-0 pointer-events-none">
          {equippedClothing.map((item, index) => {
            if (!item) return null;

            let position = {};
            let size = "text-4xl";

            switch (item.type) {
              case "hat":
                position = { top: "0px", left: "50%", transform: "translateX(-50%)" };
                size = "text-5xl";
                break;
              case "shirt":
                position = { top: "145px", left: "50%", transform: "translateX(-50%)" };
                size = "text-5xl";
                break;
              case "shoes":
                position = { bottom: "8px", left: "50%", transform: "translateX(-50%)" };
                size = "text-4xl";
                break;
              case "accessory":
                position = { top: "75px", right: "20px" };
                size = "text-4xl";
                break;
            }

            return (
              <motion.div
                key={item.id}
                className={`absolute ${size}`}
                style={position}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200
                }}
              >
                {item.icon}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
