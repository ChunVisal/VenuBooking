// src/pages/Home/Home.jsx
import Hero from "./Hero"
import Filter from "./Filter"
import QuickFilter from "./QuickFilter"
import EventList from "./EventList"

export default function Home() {
  return (
    <div>
        <Hero />
        <Filter />
        <QuickFilter />
        <EventList />
    </div>
  )
}
