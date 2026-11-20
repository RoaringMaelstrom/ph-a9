import Banner from "@/app/components/landing/Banner"
import DynamicSection1 from "@/app/components/landing/DynamicSection1"
import DynamicSection2 from "@/app/components/landing/DynamicSection2"

export default function HomePage() {
  return (
    <main>
      <Banner />
      <DynamicSection1 />
      <DynamicSection2 />
    </main>
  )
}
