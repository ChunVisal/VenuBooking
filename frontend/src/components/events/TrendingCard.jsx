import { Calendar, MapPin, Clock, Tag, ChevronRight } from "lucide-react";

export default function Trending({event}) {
  return (
    <div className="lg:w-[19.5rem] w-[15rem] flex-shrink-0 cursor-pointer">
      <div className="flex flex-col h-full rounded-xs shadow-xs hover:shadow-sm transition duration-300 overflow-hidden border border-gray-200">
        {/* Image */}
        <div className="h-44 overflow-hidden relative">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
          />
          <span className="absolute top-2 right-2 text-white text-sm sm:text-lg px-3 py-1 rounded-sm shadow bg-white/25 backdrop-blur-xl">
            {event.price}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h6 className="text-gray-900 mb-1 text-sm">
            {event.title}
          </h6>

          {/* Date & Time */}
          <div className="flex items-center text-gray-800 text-xs sm:text-sm my-1 sm:my-2">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center text-gray-800 text-xs sm:text-sm mb-2">
            <Clock className="h-4 w-4 mr-1" />
            <span>{event.time}</span>
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-800 text-xs sm:text-sm mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">{event.location}</span>
          </div>

          {/* Features */}
          <ul className="text-gray-700 mb-4 text-xs sm:text-sm list-disc list-inside space-y-0.5">
            {event.features.map((desc, i) => (
              <li key={i} className="line-clamp-1">{desc}</li>
            ))}
          </ul>

          {/* Category + Action */}
          <div className="flex justify-between items-center mt-auto">
            <span className="inline-flex items-center text-xs sm:text-sm bg-gray-300 text-gray-700 px-2 sm:px-3 py-0.5 rounded-full font-medium">
              <Tag className="h-3 w-3 mr-1" /> {event.category}
            </span>
            <button className="text-orange-600 hover:text-gray-800 flex items-center text-xs sm:text-sm font-medium">
              Details <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
