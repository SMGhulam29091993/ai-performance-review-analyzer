import { z } from "zod";

/**
 * Department enum (matches Mongoose enum)
 */
export const DepartmentEnum = z.enum([
  "Engineering",
  "Sales",
  "Marketing",
  "HR",
  "Finance",
  "Operations",
  "Product",
  "Customer Support",
  "Other",
]);

/**
 * Employee Zod Schema
 */
export const EmployeeZodSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),

  firstName: z.string().min(1, "First name is required").trim(),

  lastName: z.string().min(1, "Last name is required").trim(),

  email: z
    .string()
    .email("Invalid email address")
    .transform((val) => val.toLowerCase().trim()),

  department: DepartmentEnum,

  position: z.string().min(1, "Position is required"),

  managerId: z.string().optional(), // ref: Employee

  dateOfJoining: z.coerce.date(), // allows string → Date conversion

  isActive: z.boolean().default(true),
});

/**
 * Inferred TypeScript type
 */
export type IEmployee = z.infer<typeof EmployeeZodSchema>;
