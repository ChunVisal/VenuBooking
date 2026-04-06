// src/data/categories.js
import {
  Music,
  Briefcase,
  Laptop,
  Utensils,
  Palette,
  Trophy,
  BookOpen,
  Heart,
  HandHeart,
  Clapperboard,
  Users,
  Wrench,
  Mic2,
  PartyPopper,
  Sparkles,
} from "lucide-react";

export const categories = [
  { id: "music", name: "Music", icon: Music, value: "Music" },
  { id: "business", name: "Business", icon: Briefcase, value: "Business" },
  { id: "tech", name: "Technology", icon: Laptop, value: "Tech" },
  { id: "food", name: "Food & Drink", icon: Utensils, value: "Food" },
  { id: "art", name: "Arts & Culture", icon: Palette, value: "Art" },
  { id: "sports", name: "Sports & Fitness", icon: Trophy, value: "Sports" },
  { id: "education", name: "Education", icon: BookOpen, value: "Education" },
  { id: "health", name: "Health & Wellness", icon: Heart, value: "Health" },
  {
    id: "charity",
    name: "Charity & Causes",
    icon: HandHeart,
    value: "Charity",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: Clapperboard,
    value: "Entertainment",
  },
  { id: "networking", name: "Networking", icon: Users, value: "Networking" },
  { id: "workshop", name: "Workshop", icon: Wrench, value: "Workshop" },
  { id: "conference", name: "Conference", icon: Mic2, value: "Conference" },
  { id: "festival", name: "Festival", icon: PartyPopper, value: "Festival" },
  { id: "other", name: "Other", icon: Sparkles, value: "Other" },
];

export const getCategoryById = (id) => {
  return categories.find((cat) => cat.id === id);
};

export const getCategoryByName = (name) => {
  return categories.find((cat) => cat.value === name);
};
