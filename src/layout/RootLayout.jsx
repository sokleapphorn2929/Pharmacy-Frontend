import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function RootLayout() {
  return (
    <div className="app-container">
      <Navbar />

      <main className="content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
