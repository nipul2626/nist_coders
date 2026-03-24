"use client";

import { useState } from "react";
import { X, Check, Users, Calendar, MapPin, Clock, CreditCard, Ticket, User, Mail, Phone, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import type { Event, TicketType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RegistrationModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

type Step = "tickets" | "info" | "payment" | "confirmation";

interface TicketSelection {
  typeId: string;
  quantity: number;
}

export function RegistrationModal({ event, isOpen, onClose }: RegistrationModalProps) {
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

  if (!isOpen) return null;

  const steps: { key: Step; label: string }[] = [
    { key: "tickets", label: "Select Tickets" },
    { key: "info", label: "Your Info" },
    { key: "payment", label: "Payment" },
    { key: "confirmation", label: "Confirmation" },
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
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setCurrentStep("confirmation");
  };

  const isFreeEvent = event.ticketTypes?.every((t) => t.price === 0) || !event.ticketTypes?.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <GlassmorphicCard 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden"
        glowColor="primary"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h2 className="text-xl font-bold text-foreground">Register for Event</h2>
            <p className="text-sm text-muted-foreground mt-1">{event.title}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                      index < currentStepIndex
                        ? "bg-primary text-primary-foreground"
                        : index === currentStepIndex
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {index < currentStepIndex ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs mt-1 hidden sm:block",
                      index === currentStepIndex
                        ? "text-primary font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-12 sm:w-20 h-0.5 mx-2",
                      index < currentStepIndex ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {currentStep === "tickets" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Ticket className="h-5 w-5" />
                <span>Select your tickets</span>
              </div>

              {event.ticketTypes?.map((ticketType) => (
                <TicketTypeCard
                  key={ticketType.id}
                  ticketType={ticketType}
                  quantity={
                    selectedTickets.find((s) => s.typeId === ticketType.id)?.quantity || 0
                  }
                  onChange={(qty) => handleTicketChange(ticketType.id, qty)}
                />
              ))}

              {(!event.ticketTypes || event.ticketTypes.length === 0) && (
                <div className="text-center py-8">
                  <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Free registration - no ticket selection needed</p>
                </div>
              )}
            </div>
          )}

          {currentStep === "info" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <User className="h-5 w-5" />
                <span>Your information</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="John"
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
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
                <Label htmlFor="email">Email</Label>
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
                <Label htmlFor="phone">Phone (Optional)</Label>
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
                  placeholder="Wheelchair access, sign language..."
                  className="bg-background/50"
                />
              </div>

              <div className="flex items-start gap-2 pt-4">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreeToTerms: checked as boolean })
                  }
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                  I agree to the terms of service and privacy policy. I understand that my
                  information will be shared with the event organizer.
                </Label>
              </div>
            </div>
          )}

          {currentStep === "payment" && (
            <div className="space-y-6">
              {isFreeEvent || totalAmount === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Free Event</h3>
                  <p className="text-muted-foreground">
                    No payment required. Click confirm to complete your registration.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment details</span>
                  </div>

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
                </>
              )}

              {/* Order Summary */}
              <div className="border-t border-border/50 pt-4 mt-6">
                <h4 className="font-medium text-foreground mb-3">Order Summary</h4>
                <div className="space-y-2">
                  {selectedTickets.map((selection) => {
                    const ticketType = event.ticketTypes?.find((t) => t.id === selection.typeId);
                    if (!ticketType) return null;
                    return (
                      <div key={selection.typeId} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {ticketType.name} x {selection.quantity}
                        </span>
                        <span className="text-foreground">
                          ${(ticketType.price * selection.quantity).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between font-medium text-foreground pt-2 border-t border-border/50">
                    <span>Total</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === "confirmation" && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Check className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Registration Complete!</h3>
              <p className="text-muted-foreground mb-6">
                You&apos;re all set for {event.title}. We&apos;ve sent a confirmation email to {formData.email}.
              </p>

              <GlassmorphicCard className="text-left p-4 mb-6">
                <h4 className="font-medium text-foreground mb-3">Event Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.startDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(event.startDate).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Ticket className="h-4 w-4" />
                    <span>{totalTickets} ticket{totalTickets !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </GlassmorphicCard>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button className="bg-primary hover:bg-primary/90">
                  Add to Calendar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {currentStep !== "confirmation" && (
          <div className="flex items-center justify-between p-6 border-t border-border/50">
            <div>
              {totalTickets > 0 && (
                <p className="text-sm text-muted-foreground">
                  {totalTickets} ticket{totalTickets !== 1 ? "s" : ""} · ${totalAmount.toFixed(2)}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {currentStepIndex > 0 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
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
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === "tickets" && totalTickets === 0 && event.ticketTypes?.length) ||
                    (currentStep === "info" && (!formData.firstName || !formData.lastName || !formData.email || !formData.agreeToTerms))
                  }
                  className="bg-primary hover:bg-primary/90"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </GlassmorphicCard>
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
    <GlassmorphicCard
      className={cn(
        "p-4 transition-all duration-300",
        quantity > 0 && "ring-2 ring-primary",
        !isAvailable && "opacity-50"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground">{ticketType.name}</h4>
            {!isAvailable && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">
                Sold Out
              </span>
            )}
          </div>
          {ticketType.description && (
            <p className="text-sm text-muted-foreground mt-1">{ticketType.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {ticketType.price === 0 ? "Free" : `$${ticketType.price.toFixed(2)}`}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {remaining} left
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onChange(Math.max(0, quantity - 1))}
            disabled={quantity === 0 || !isAvailable}
          >
            -
          </Button>
          <span className="w-8 text-center font-medium text-foreground">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onChange(Math.min(ticketType.maxPerUser || 10, quantity + 1))}
            disabled={!isAvailable || quantity >= (ticketType.maxPerUser || 10)}
          >
            +
          </Button>
        </div>
      </div>
    </GlassmorphicCard>
  );
}
