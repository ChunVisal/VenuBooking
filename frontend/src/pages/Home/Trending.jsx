import { useState } from "react";
import TrendingCard from "../../components/events/TrendingCard";
import { EVENTS } from "../../components/data/dataEvent";

const EventList = () => {
  const [filter, setFilter] = useState("All");

  const filteredEvents =
    filter === "All" ? EVENTS : EVENTS.filter((e) => e.category === filter);

  return (
    <section className="my-8 mx-4">
      <div className="mx-auto w-full">
     <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory">
          {filteredEvents.map((event) => (
            <TrendingCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventList;

// make this auto animation move loop and when I drag on it I can drag move and can control it stop also 