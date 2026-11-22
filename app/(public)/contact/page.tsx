import { Headphones, Mail, MapPin, Phone, type LucideIcon } from "lucide-react"

import ContactForm from "@/components/contact/ContactForm"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const metadata = {
  title: "Contact Us | EasyRent",
  description:
    "Have questions about renting equipment or using EasyRent? Get in touch with our team and we will help you out.",
}

const CONTACT_DETAILS: {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
  placeholder?: boolean
}[] = [
  {
    icon: Mail,
    label: "Email",
    value: "easyrent@gmail.com",
    hint: "We reply as soon as we can",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "Not available yet",
    hint: "Placeholder — add a support number",
    placeholder: true,
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Bangladesh",
    hint: "Serving customers nationwide",
  },
  {
    icon: Headphones,
    label: "Support",
    value: "Customer support",
    hint: "Help with rental-related questions",
  },
]

const FAQS = [
  {
    question: "How do I rent equipment on EasyRent?",
    answer:
      "Browse the catalogue, open an equipment listing to view its details, and submit a rental request for the dates you need. You will be guided through payment after your request is confirmed.",
  },
  {
    question: "What types of equipment are available?",
    answer:
      "EasyRent lists equipment across categories such as construction, photography, vehicles, agriculture, electronics, and events. You can filter the catalogue by category and rental type.",
  },
  {
    question: "Can I choose the rental duration?",
    answer:
      "Yes. Listings support Daily, Weekly, and Monthly rental options so you can choose the period that best fits your project.",
  },
  {
    question: "How do I know if equipment is available?",
    answer:
      "Each listing shows its current availability, and the details page checks live availability for your selected rental dates before you confirm a booking.",
  },
  {
    question: "What should I do if I have a problem with my rental?",
    answer:
      "Send us a message using the contact form on this page with your booking details, or email easyrent@gmail.com. Our support team will help resolve rental-related questions.",
  },
]

export default function ContactPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-slate-50 py-16 sm:py-20 lg:py-24">
        <div
          aria-hidden="true"
          className="absolute -top-40 left-1/2 -z-10 size-[30rem] -translate-x-1/2 rounded-full bg-emerald-100/60 blur-3xl"
        />
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full border border-emerald-100 bg-white px-3.5 py-2 text-xs font-semibold tracking-[0.16em] text-emerald-700 uppercase">
              Contact Us
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              Have questions about renting equipment or using EasyRent? We are
              here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact form + information */}
      <section className="relative isolate overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-5 lg:gap-12 lg:px-8">
          <div className="space-y-5 lg:col-span-2">
            {CONTACT_DETAILS.map(
              ({ icon: Icon, label, value, hint, placeholder }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03] transition-colors duration-300 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/[0.06]"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">
                        {label}
                      </p>
                      {placeholder ? (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-700">
                          Placeholder
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-base font-bold break-words text-slate-900">
                      {label === "Email" ? (
                        <a
                          href={`mailto:${value}`}
                          className="transition-colors duration-200 hover:text-emerald-700"
                        >
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </p>
                    {hint ? (
                      <p className="mt-0.5 text-sm text-slate-500">{hint}</p>
                    ) : null}
                  </div>
                </div>
              )
            )}

            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/banner.png"
                alt="Equipment available for rent on EasyRent"
                className="h-48 w-full object-cover object-center"
              />
              <div className="bg-white p-5">
                <p className="text-sm font-bold text-slate-900">
                  Need a hand finding the right gear?
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Tell us what you are working on and we will point you toward
                  suitable equipment.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative isolate overflow-hidden bg-slate-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold tracking-[0.18em] text-emerald-700 uppercase">
              FAQ
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Quick answers to common questions about renting equipment on
              EasyRent.
            </p>
          </div>

          <Accordion
            defaultValue={["faq-1"]}
            className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-white px-5 shadow-sm shadow-slate-900/[0.03] sm:px-7"
          >
            {FAQS.map((faq, index) => (
              <AccordionItem key={faq.question} value={`faq-${index + 1}`}>
                <AccordionTrigger className="py-5 text-base font-semibold text-slate-900 hover:text-emerald-700 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-7 text-slate-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </main>
  )
}
