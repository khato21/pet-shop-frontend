import type { SVGProps } from "react";

import dogIcon from "../../assets/icons/dog.svg";
import braveIcon from "../../assets/icons/brave.svg";
import lizardIcon from "../../assets/icons/lizard.svg";
import foxIcon from "../../assets/icons/fox.svg";
import catIcon from "../../assets/icons/cat.svg";
import fishIcon from "../../assets/icons/fish.svg";
import birdIcon from "../../assets/icons/bird.svg";
import hamsterIcon from "../../assets/icons/hamster.svg";

import styles from "./CategoryIcon.module.css";

interface CategoryIconProps extends SVGProps<SVGSVGElement> {
  category: string;
}

const CategoryIcon = ({ category, className = "" }: CategoryIconProps) => {
  const normalizedCategory = category.toLowerCase();

  const iconClassName = `${styles.icon} ${className}`.trim();

  if (normalizedCategory === "dogs") {
    return (
      <img className={iconClassName} src={dogIcon} alt="" aria-hidden="true" />
    );
  }

  if (normalizedCategory === "wildlife") {
    return (
      <img
        className={iconClassName}
        src={braveIcon}
        alt=""
        aria-hidden="true"
      />
    );
  }

  if (normalizedCategory === "reptiles") {
    return (
      <img
        className={iconClassName}
        src={lizardIcon}
        alt=""
        aria-hidden="true"
      />
    );
  }

  if (normalizedCategory === "exotic pets") {
    return (
      <img className={iconClassName} src={foxIcon} alt="" aria-hidden="true" />
    );
  }

  if (normalizedCategory === "cats") {
    return (
      <img className={iconClassName} src={catIcon} alt="" aria-hidden="true" />
    );
  }

  if (normalizedCategory === "fish") {
    return (
      <img className={iconClassName} src={fishIcon} alt="" aria-hidden="true" />
    );
  }

  if (normalizedCategory === "birds") {
    return (
      <img className={iconClassName} src={birdIcon} alt="" aria-hidden="true" />
    );
  }

  if (normalizedCategory === "small pets") {
    return (
      <img
        className={iconClassName}
        src={hamsterIcon}
        alt=""
        aria-hidden="true"
      />
    );
  }

  return (
    <svg
      className={iconClassName}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M32 9C19 9 10 19 10 32C10 45 19 55 32 55C45 55 54 45 54 32C54 19 45 9 32 9Z"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M22 30C24 27 27 26 30 27M34 27C37 26 40 27 42 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M27 38C30 41 34 41 37 38"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default CategoryIcon;
