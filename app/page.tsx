import Banner from "@/components/home/Banner"
import Categories from "@/components/home/Categories"
import CustomerReviews from "@/components/home/CustomerReviews"
import FeaturedEquipment from "@/components/home/FeaturedEquipment"
import HowItWorks from "@/components/home/HowItWorks"
import RecentlyAddedEquipment from "@/components/home/RecentlyAddedEquipment"
import WhyChooseUs from "@/components/home/WhyChooseUs"

export default function Page() {
  return (
    <>
      <Banner />
      <FeaturedEquipment />
      <Categories />
      <WhyChooseUs />
      <CustomerReviews />
      <HowItWorks />
      <RecentlyAddedEquipment />
    </>
  )
}
