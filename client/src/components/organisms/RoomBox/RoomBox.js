import ChatIcon from '@/components/molecules/ChatIcon';
export default function RoomBox({
  currentRoom,
  roomStack
}) {
  return (
      <div
        id = 'recipientbox'
        className="w-1/3 h-full md:w-1/3 mb-2 border border-black rounded-md overflow-hidden justify-center 
                    "
        >
          <div className='h-fit'>Room List</div>
          <div className='h-auto overflow-y-scroll 
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-gray-100
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-gray-300
          'style={{ height: '94%'}}>
            {roomStack.map((item,index) => (<ChatIcon 
          key = {index}
          currentRoom = {currentRoom}
          Room = {item}/>))}
          </div>
      </div>
  );
}
