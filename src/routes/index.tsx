import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout/MainLayout";

import HomePage from "../pages/Home/HomePage";
import AnimalsPage from "../pages/Animals/AnimalsPage";
import PopularAnimalsPage from "../pages/PopularAnimals/PopularAnimalsPage";
import AnimalDetailsPage from "../pages/AnimalDetails/AnimalDetailsPage";
import CategoriesPage from "../pages/Categories/CategoriesPage";
import CategoryDetails from "../pages/CategoryDetails/CategoryDetails";
import CartPage from "../pages/Cart/CartPage";
import CheckoutPage from "../pages/Checkout/CheckoutPage";
import WishlistPage from "../pages/Wishlist/WishlistPage";
import AboutUsPage from "../pages/AboutUs/AboutUsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },

      {
        path: "animals",
        element: <AnimalsPage />,
      },

      {
        path: "animals/popular",
        element: <PopularAnimalsPage />,
      },

      {
        path: "animals/:id",
        element: <AnimalDetailsPage />,
      },

      {
        path: "categories",
        element: <CategoriesPage />,
      },

      {
        path: "categories/:id",
        element: <CategoryDetails />,
      },

      {
        path: "cart",
        element: <CartPage />,
      },

      {
        path: "checkout",
        element: <CheckoutPage />,
      },

      {
        path: "wishlist",
        element: <WishlistPage />,
      },

      {
        path: "about-us",
        element: <AboutUsPage />,
      },
    ],
  },
]);
