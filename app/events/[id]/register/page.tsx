"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Ticket, 
  Check, 
  CreditCard,
  User,
  Mail,
  Phone,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { GradientBackground } from "@/components/animations/gradient-background";
import { mockEvents } from "@/lib/mock-data";
import type { Event, TicketType } from "@/lib/types";
import { cn } from "@/lib/utils";

type Step = "tickets" | "info" | "payment" | "confirmation";

interface TicketSelection {
  typeId: string;
  quantity: number;
}

export default function RegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>("tickets");
  const [selectedTickets, setSelectedTickets] = useState<TicketSelection[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dietaryRestrictions: "",
    accessibilityNeeds: "",
    agreeToTerms: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const foundEvent = mockEvents.find((e) => e.id === resolvedParams.id);
    setEvent(foundEvent || null);
    
    // Auto-select first ticket if only one type exists
    if (foundEvent?.ticketTypes?.length === 1) {
      setSelectedTickets([{ typeId: foundEvent.ticketTypes[0].id, quantity: 1 }]);
    }
  }, [resolvedParams.id]);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    );
  }

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: "tickets", label: "Tickets", icon: <Ticket className="h-4 w-4" /> },
    { key: "info", label: "Info", icon: <User className="h-4 w-4" /> },
    { key: "payment", label: "Payment", icon: <CreditCard className="h-4 w-4" /> },
    { key: "confirmation", label: "Done", icon: <Check className="h-4 w-4" /> },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  const totalAmount = selectedTickets.reduce((sum, selection) => {
    const ticketType = event.ticketTypes?.find((t) => t.id === selection.typeId);
    return sum + (ticketType?.price || 0) * selection.quantity;
  }, 0);

  const totalTickets = selectedTickets.reduce((sum, s) => sum + s.quantity, 0);

  const handleTicketChange = (typeId: string, quantity: number) => {
    setSelectedTickets((prev) => {
      const existing = prev.find((s) => s.typeId === typeId);
      if (existing) {
        if (quantity === 0) {
          return prev.filter((s) => s.typeId !== typeId);
        }
        return prev.map((s) => (s.typeId === typeId ? { ...s, quantity } : s));
      }
      if (quantity > 0) {
        return [...prev, { typeId, quantity }];
      }
      return prev;
    });
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setCurrentStep("confirmation");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isFreeEvent = event.ticketTypes?.every((t) => t.price === 0) || !event.ticketTypes?.length;
  const canProceed = 
    (currentStep === "tickets" && (totalTickets > 0 || !event.ticketTypes?.length)) ||
    (currentStep === "info" && formData.firstName && formData.lastName && formData.email && formData.agreeToTerms) ||
    currentStep === "payment";

  return (
    <div className="min-h-screen">
      <GradientBackground />
      
      <main className="relative z-10 pt-24 pb-16">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <Link 
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to event
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Register for Event</h1>
            <p className="text-muted-foreground">{event.title}</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                        index < currentStepIndex
                          ? "bg-primary text-primary-foreground"
                          : index === currentStepIndex
                          ? "bg-primary/20 text-primary border-2 border-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {index < currentStepIndex ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-sm mt-2 font-medium",
                        index === currentStepIndex
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-4",
                        index < currentStepIndex ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <GlassmorphicCard className="p-6" glowColor="primary">
                {currentStep === "tickets" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Ticket className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">Select Your Tickets</h2>
                        <p className="text-sm text-muted-foreground">Choose the ticket type and quantity</p>
                      </div>
                    </div>

                    {event.ticketTypes && event.ticketTypes.length > 0 ? (
                      <div className="space-y-4">
                        {event.ticketTypes.map((ticketType) => (
                          <TicketTypeCard
                            key={ticketType.id}
                            ticketType={ticketType}
                            quantity={
                              selectedTickets.find((s) => s.typeId === ticketType.id)?.quantity || 0
                            }
                            onChange={(qty) => handleTicketChange(ticketType.id, qty)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                          <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">Free Registration</h3>
                        <p className="text-muted-foreground">
                          This event is free to attend. No ticket selection required.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === "info" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">Your Information</h2>
                        <p className="text-sm text-muted-foreground">Tell us a bit about yourself</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="John"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Doe"
                          className="bg-background/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@university.edu"
                          className="pl-10 bg-background/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                          className="pl-10 bg-background/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dietary">Dietary Restrictions (Optional)</Label>
                      <Input
                        id="dietary"
                        value={formData.dietaryRestrictions}
                        onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                        placeholder="Vegetarian, vegan, allergies..."
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accessibility">Accessibility Needs (Optional)</Label>
                      <Input
                        id="accessibility"
                        value={formData.accessibilityNeeds}
                        onChange={(e) => setFormData({ ...formData, accessibilityNeeds: e.target.value })}
                        placeholder="Wheelchair access, sign language interpreter..."
                        className="bg-background/50"
                      />
                    </div>

                    <div className="flex items-start gap-3 pt-4 border-t border-border/50">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, agreeToTerms: checked as boolean })
                        }
                      />
                      <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                        I agree to the terms of service and privacy policy. I understand that my
                        information will be shared with the event organizer for the purpose of
                        this registration.
                      </Label>
                    </div>
                  </div>
                )}

                {currentStep === "payment" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">Payment</h2>
                        <p className="text-sm text-muted-foreground">Complete your registration</p>
                      </div>
                    </div>

                    {isFreeEvent || totalAmount === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                          <Sparkles className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">No Payment Required</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          This is a free event! Click the button below to confirm your registration
                          and secure your spot.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input
                            id="cardNumber"
                            placeholder="4242 4242 4242 4242"
                            className="bg-background/50"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input
                              id="expiry"
                              placeholder="MM/YY"
                              className="bg-background/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input
                              id="cvc"
                              placeholder="123"
                              className="bg-background/50"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cardName">Name on Card</Label>
                          <Input
                            id="cardName"
                            placeholder="John Doe"
                            className="bg-background/50"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === "confirmation" && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                      <Check className="h-12 w-12 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">You&apos;re All Set!</h2>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      Your registration for {event.title} is confirmed. We&apos;ve sent a confirmation
                      email to {formData.email} with all the details.
                    </p>

                    <GlassmorphicCard className="text-left p-6 mb-8 max-w-md mx-auto">
                      <h4 className="font-semibold text-foreground mb-4">Event Details</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Calendar className="h-5 w-5 text-primary" />
                          <span>{new Date(event.startDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Clock className="h-5 w-5 text-primary" />
                          <span>{new Date(event.startDate).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <MapPin className="h-5 w-5 text-primary" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Ticket className="h-5 w-5 text-primary" />
                          <span>{totalTickets || 1} ticket{(totalTickets || 1) !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                    </GlassmorphicCard>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button variant="outline" asChild>
                        <Link href="/events">Browse More Events</Link>
                      </Button>
                      <Button className="bg-primary hover:bg-primary/90" asChild>
                        <Link href="/dashboard">View My Tickets</Link>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                {currentStep !== "confirmation" && (
                  <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/50">
                    {currentStepIndex > 0 ? (
                      <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                    ) : (
                      <div />
                    )}

                    {currentStep === "payment" ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={isProcessing}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Confirm Registration
                            <Check className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        disabled={!canProceed}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </GlassmorphicCard>
            </div>

            {/* Sidebar - Order Summary */}
            {currentStep !== "confirmation" && (
              <div className="lg:col-span-1">
                <GlassmorphicCard className="p-6 sticky top-24">
                  <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
                  
                  {/* Event Info */}
                  <div className="space-y-3 pb-4 border-b border-border/50">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {event.imageUrl ? (
                          <img 
                            src={event.imageUrl} 
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm line-clamp-2">{event.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(event.startDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Breakdown */}
                  {selectedTickets.length > 0 && (
                    <div className="py-4 border-b border-border/50 space-y-2">
                      {selectedTickets.map((selection) => {
                        const ticketType = event.ticketTypes?.find((t) => t.id === selection.typeId);
                        if (!ticketType) return null;
                        return (
                          <div key={selection.typeId} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {ticketType.name} x {selection.quantity}
                            </span>
                            <span className="text-foreground">
                              {ticketType.price === 0 ? "Free" : `$${(ticketType.price * selection.quantity).toFixed(2)}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Total */}
                  <div className="pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="text-xl font-bold text-primary">
                        {totalAmount === 0 ? "Free" : `$${totalAmount.toFixed(2)}`}
                      </span>
                    </div>
                    {totalTickets > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {totalTickets} ticket{totalTickets !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </GlassmorphicCard>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function TicketTypeCard({
  ticketType,
  quantity,
  onChange,
}: {
  ticketType: TicketType;
  quantity: number;
  onChange: (qty: number) => void;
}) {
  const remaining = ticketType.available - ticketType.sold;
  const isAvailable = remaining > 0;

  return (
    <div
      className={cn(
        "p-4 rounded-xl border transition-all duration-300",
        quantity > 0 
          ? "border-primary bg-primary/5" 
          : "border-border/50 bg-background/30",
        !isAvailable && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground">{ticketType.name}</h4>
            {!isAvailable && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive font-medium">
                Sold Out
              </span>
            )}
          </div>
          {ticketType.description && (
            <p className="text-sm text-muted-foreground mt-1">{ticketType.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="font-semibold text-primary">
              {ticketType.price === 0 ? "Free" : `$${ticketType.price.toFixed(2)}`}
            </span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              {remaining} remaining
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => onChange(Math.max(0, quantity - 1))}
            disabled={quantity === 0 || !isAvailable}
          >
            -
          </Button>
          <span className="w-10 text-center font-semibold text-foreground">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => onChange(Math.min(ticketType.maxPerUser || 10, quantity + 1))}
            disabled={!isAvailable || quantity >= (ticketType.maxPerUser || 10) || quantity >= remaining}
          >
            +
          </Button>
        </div>
      </div>
    </div>
  );
}
