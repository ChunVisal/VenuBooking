// src/pages/Home/Home.jsx
import Hero from "./Hero"
import Filter from "./Filter"
import QuickFilter from "./QuickFilter"
import Trending from "./Trending"
import EventList from "./EventList"

export default function Home() {
  return (
    <div>
        <Hero />
        <Filter />
        <QuickFilter />
        <Trending />
        <EventList />
    </div>
  )
}
