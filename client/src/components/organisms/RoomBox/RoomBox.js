import ChatIcon from '@/components/molecules/ChatIcon';
export default function RoomBox({
  roomStack
}) {
  return (
      <div
        id = 'recipientbox'
        className="w-1/3 h-full md:w-1/3 mb-2 border border-black rounded-md overflow-y-scroll 
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-gray-100
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-gray-300"
        >
          {roomStack.map((item,index) => (<ChatIcon 
          key = {index}
          Room = {item}/>))}
      </div>
  );
}
