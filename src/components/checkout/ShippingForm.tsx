"use client";

import * as React from "react";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface ShippingFormProps {
  data: FormData;
  onChange: (data: FormData) => void;
  errors?: Partial<Record<keyof FormData, string>>;
}

export function ShippingForm({ data, onChange, errors = {} }: ShippingFormProps) {
  const handleChange = (field: keyof FormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div>
      <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
        Shipping Address
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            First Name
          </label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className={`w-full px-4 py-3 bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors ${
              errors.firstName ? "border-red-500" : "border-border"
            }`}
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Last Name
          </label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className={`w-full px-4 py-3 bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors ${
              errors.lastName ? "border-red-500" : "border-border"
            }`}
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={`w-full px-4 py-3 bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors ${
              errors.email ? "border-red-500" : "border-border"
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Phone
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className={`w-full px-4 py-3 bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors ${
              errors.phone ? "border-red-500" : "border-border"
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Address
          </label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className={`w-full px-4 py-3 bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors ${
              errors.address ? "border-red-500" : "border-border"
            }`}
          />
          {errors.address && (
            <p className="mt-1 text-xs text-red-600">{errors.address}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            City
          </label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className={`w-full px-4 py-3 bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors ${
              errors.city ? "border-red-500" : "border-border"
            }`}
          />
          {errors.city && (
            <p className="mt-1 text-xs text-red-600">{errors.city}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            State
          </label>
          <input
            type="text"
            value={data.state}
            onChange={(e) => handleChange("state", e.target.value)}
            className={`w-full px-4 py-3 bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors ${
              errors.state ? "border-red-500" : "border-border"
            }`}
          />
          {errors.state && (
            <p className="mt-1 text-xs text-red-600">{errors.state}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            ZIP Code
          </label>
          <input
            type="text"
            value={data.zip}
            onChange={(e) => handleChange("zip", e.target.value)}
            className={`w-full px-4 py-3 bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors ${
              errors.zip ? "border-red-500" : "border-border"
            }`}
          />
          {errors.zip && (
            <p className="mt-1 text-xs text-red-600">{errors.zip}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Country
          </label>
          <input
            type="text"
            value={data.country}
            onChange={(e) => handleChange("country", e.target.value)}
            className={`w-full px-4 py-3 bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors ${
              errors.country ? "border-red-500" : "border-border"
            }`}
          />
          {errors.country && (
            <p className="mt-1 text-xs text-red-600">{errors.country}</p>
          )}
        </div>
      </div>
    </div>
  );
}
