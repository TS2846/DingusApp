import {Users} from 'lucide-react';
import {Button} from '../ui/button';

const FriendHeader = () => {
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-6">
                {/* Friends section with icon */}
                <div className="flex items-center gap-2 text-gray-200">
                    <Users size={20} />
                    <span className="font-medium">Friends</span>
                </div>

                {/* Navigation items */}
                <div className="flex items-center gap-4">
                    {/* Status filters */}
                    <span className="px-3 py-1 rounded text-gray-200 cursor-pointer">
                        Online
                    </span>
                    <span className="px-3 py-1 rounded text-gray-400 cursor-pointer">
                        All
                    </span>
                    <span className="px-3 py-1 rounded text-gray-400 cursor-pointer">
                        Pending
                    </span>
                    <span className="px-3 py-1 rounded text-gray-400 cursor-pointer">
                        Blocked
                    </span>
                </div>
            </div>

            {/* Add Friend button */}
            <button className="ml-auto px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded">
                Add Friend
            </button>
        </div>
    );
};

export default FriendHeader;
