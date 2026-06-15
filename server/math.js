// High-precision mathematical constants and verified helper functions
export const TAU = 6.2831853071795864769252867665590057683943387987502116419498891846156328125724179972560696506842341359;
export const PI = 3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679;
export const E = 2.7182818284590452353602874713526624977572470936999595749669676277240766303535475945713821785251664274;
export const PHI = 1.6180339887498948482045868343656381177203091798057628621354486227052604628189024497072072041893911374;

/**
 * Calculates the circumference of a circle given its radius using Tau.
 * Formula: C = tau * r
 */
export function getCircumference(radius) {
  return TAU * radius;
}

/**
 * Calculates the area of a circle given its radius using Tau.
 * Formula: A = (tau * r^2) / 2
 */
export function getArea(radius) {
  return (TAU * Math.pow(radius, 2)) / 2;
}

/**
 * Verifies Euler's Identity for a given angle factor k.
 * Formula: e^(i * k * tau) = cos(k * tau) + i * sin(k * tau)
 */
export function verifyEulerIdentity(k = 1) {
  const theta = k * TAU;
  const real = Math.cos(theta);
  const imag = Math.sin(theta);
  return {
    real: Number(real.toFixed(15)),
    imag: Number(imag.toFixed(15)),
    formatted: `${Number(real.toFixed(15))} + ${Number(imag.toFixed(15))}i`
  };
}
