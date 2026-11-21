
"use client";

import { motion } from "framer-motion";
import {
  HardHat,
  Camera,
  Truck,
  Tractor,
  Laptop,
  PartyPopper,
} from "lucide-react";

const categories = [
  {
    name: "Construction Equipment",
    description: "Tools and machinery for construction projects.",
    icon: HardHat,
  },
  {
    name: "Photography Equipment",
    description: "Cameras and accessories for photography.",
    icon: Camera,
  },
  {
    name: "Vehicles & Transportation",
    description: "Vehicles and transport equipment for rent.",
    icon: Truck,
  },
  {
    name: "Agriculture Equipment",
    description: "Modern tools for farming and agriculture.",
    icon: Tractor,
  },
  {
    name: "Electronics",
    description: "Useful electronic devices and equipment.",
    icon: Laptop,
  },
  {
    name: "Event Equipment",
    description: "Equipment for parties and special events.",
    icon: PartyPopper,
  },
];

export default function Categories() {
  return (
    <section className="bg-white px-4 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <p className="mb-2 font-semibold text-emerald-600">
            EXPLORE CATEGORIES
          </p>

          <h2 className="text-3xl font-bold text-slate-800 md:text-4xl">
            Browse Equipment Categories
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            Find the equipment you need from our wide range of
            rental categories.
          </p>
        </motion.div>

        {/* Category Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {categories.map((category, index) => {
            const Icon = category.icon;

            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                }}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                  <Icon size={28} />
                </div>

                <h3 className="text-lg font-bold text-slate-800">
                  {category.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {category.description}
                </p>
              </motion.div>
            );
          })}

        </div>
      </div>
    </section>
  );
}
