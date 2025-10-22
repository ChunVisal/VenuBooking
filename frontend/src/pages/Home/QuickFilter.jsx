import React from 'react';
import {
  SquaresFour,
  RocketLaunch,
  MusicNotes,
  Trophy,
  PaintBrush,
  UsersThree,
  ForkKnife,
  Atom,
  Ticket,
  ShoppingBag,
} from "phosphor-react";

const filterCategories = [
  { name: "All", icon: SquaresFour },
  { name: "Trending", icon: RocketLaunch },
  { name: "Music", icon: MusicNotes },
  { name: "Sports", icon: Trophy },
  { name: "Arts", icon: PaintBrush },
  { name: "Networking", icon: UsersThree },
  { name: "Food", icon: ForkKnife },
  { name: "Tech", icon: Atom },
  { name: "Tickets", icon: Ticket },
  { name: "Shopping", icon: ShoppingBag },
];

const QuickFilter = () => {
    return (
        <section className="mx-auto max-w-7xl px-4 sm:px-7 mt-6">
            {/* Circular Buttons with Label Underneath */}
            <div className="flex space-x-10 overflow-x-auto pb-2 scrollbar-custom">
                {filterCategories.map((filter, index) => {
                    const Icon = filter.icon;
                    return (
                        <div key={index} className="flex flex-col items-center flex-shrink-0">
                            <button className="w-22 h-22 flex items-center justify-center border border-blue-200 rounded-full bg-gray-100 hover:bg-gray-200 transition duration-200">
                                <Icon className="h-8 w-8 text-gray-700" />
                            </button>
                            <span className="mt-2 text-center text-gray-800">{filter.name}</span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default QuickFilter;
