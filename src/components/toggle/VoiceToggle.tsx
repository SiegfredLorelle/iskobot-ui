// import React, { useState } from "react";
// import { IconMicrophone, IconMicrophoneOff } from "@tabler/icons-react";

// // Define the props interface
// type VoiceToggleProps = {
//   onToggle: (isEnabled: boolean) => void;
// };

// const VoiceToggle: React.FC<VoiceToggleProps> = ({ onToggle }) => {
//   const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

//   const handleToggle = () => {
//     const newState = !isVoiceEnabled;
//     setIsVoiceEnabled(newState);
//     if (onToggle) {
//       onToggle(newState);
//     }
//   };

//   const label = isVoiceEnabled ? "Voice On" : "Voice Off";

//   return (
//     <button
//       className="flex items-center gap-2 px-3 py-2 text-text-clr text-sm hover:bg-[var(--hover-clr)] rounded-md transition duration-200"
//       onClick={handleToggle}
//       aria-label={`Turn voice ${isVoiceEnabled ? "off" : "on"}`}
//     >
//       {isVoiceEnabled ? (
//         <IconMicrophone className="h-4 w-4" />
//       ) : (
//         <IconMicrophoneOff className="h-4 w-4" />
//       )}
//       <span>{label}</span>
//     </button>
//   );
// };

// export default VoiceToggle;
