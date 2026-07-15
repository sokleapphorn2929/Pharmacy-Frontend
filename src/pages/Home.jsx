import Carousel from "../components/Carousel";
import Category from "../components/Category";

export default function Home() {
  return (
    <div className="h-[200vh] bg-white dark:bg-slate-900 pt-20 duration-300 text-black dark:text-white px-4 sm:px-6 ">
      <Carousel />
      <Category />
    </div>
  );
}
