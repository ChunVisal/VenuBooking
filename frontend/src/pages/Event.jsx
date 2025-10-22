import React from 'react'
import Filter from '../pages/Home/Filter'
import QuickFilter from '../pages/Home/QuickFilter'
import EventList from './Home/EventList'

export default function Event() {
  return (
    <div>
        {/* <Filter /> */}
        <QuickFilter />
        <EventList />
    </div>
  )
}
