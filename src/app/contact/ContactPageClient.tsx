"use client";

import * as React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/validations";

interface ContactPageData {
  title: string;
  subtitle: string;
  email: string;
  phone: string;
  address: string;
}

export function ContactPageClient({ data }: { data: ContactPageData }) {
  const [submitted, setSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (_data: ContactInput) => {
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
          {data.title}
        </h1>
        <p className="text-muted-foreground">{data.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="flex flex-col gap-8">
          {[
            { icon: Mail, label: "Email", value: data.email },
            { icon: Phone, label: "Phone", value: data.phone },
            { icon: MapPin, label: "Address", value: data.address },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-start gap-4">
                <div className="size-10 flex items-center justify-center bg-gold/10 text-gold flex-shrink-0">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm text-foreground">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-2">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-16 mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                <Mail className="size-8 text-gold" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                Message Sent
              </h2>
              <p className="text-muted-foreground">
                Thank you for reaching out. We&apos;ll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Name</label>
                  <input
                    type="text"
                    {...register("name")}
                    className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Subject</label>
                <input
                  type="text"
                  {...register("subject")}
                  className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                />
                {errors.subject && (
                  <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Message</label>
                <textarea
                  rows={5}
                  {...register("message")}
                  className="w-full px-4 py-3 bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors resize-none"
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="self-start px-8 py-3 bg-foreground text-background text-xs font-semibold tracking-[0.2em] uppercase hover:bg-gold hover:text-foreground transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
