
export default function ChatIcon({
  currentRoom,
  Room
}){
  const isActive = Room === currentRoom;
  const colors = isActive
  ? "bg-purple-600 text-white"
  : "bg-gray-200 text-gray-800 hover:bg-gray-300";

  return(
    <div className={`rounded-md h-6 mr-10 text-center ${colors}`}

    >{Room}</div>
  );

}
