import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount: number): string {
  return `PKR ${amount.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatCurrency(
  amount: number,
  currency: string = "PKR"
): string {
  switch (currency) {
    case "PKR":
      return `PKR ${amount.toLocaleString("en-PK", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    default:
      return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Check if flexible fee structure is available
export function hasFeeStructure(student: any): boolean {
  return (
    student &&
    student.final_fee_amount !== undefined &&
    student.final_fee_amount !== null
  );
}

// Get student's effective fee amount
export function getStudentFee(student: any, classFee: number = 0): number {
  if (hasFeeStructure(student)) {
    return student.final_fee_amount;
  }
  return classFee;
}

// Calculate discount information
export function getDiscountInfo(student: any, classFee: number = 0) {
  if (!hasFeeStructure(student)) {
    return {
      hasDiscount: false,
      discountAmount: 0,
      discountPercentage: 0,
      finalFee: classFee,
      standardFee: classFee,
    };
  }

  const finalFee = student.final_fee_amount;
  const standardFee = student.standard_fee_amount || classFee;
  const discountAmount = standardFee - finalFee;
  const discountPercentage =
    standardFee > 0 ? (discountAmount / standardFee) * 100 : 0;

  return {
    hasDiscount: discountAmount > 0,
    discountAmount,
    discountPercentage,
    finalFee,
    standardFee,
  };
}
