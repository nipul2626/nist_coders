'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Upload,
  X,
  Calendar,
  MapPin,
  IndianRupee,
  Users,
  FileText,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { branches } from '@/lib/mock-data'
import type { CreateEventFormData, EventCategory } from '@/lib/types'

const steps = [
  { id: 1, title: 'Basics', icon: FileText },
  { id: 2, title: 'Details', icon: Sparkles },
  { id: 3, title: 'Rules', icon: Users },
  { id: 4, title: 'Review', icon: Eye },
]

const categories: { value: EventCategory; label: string }[] = [
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'tech-fest', label: 'Tech Fest' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'competition', label: 'Competition' },
]

interface CreateEventWizardProps {
  onSubmit: (data: CreateEventFormData) => Promise<void>
  isLoading?: boolean
}

export function CreateEventWizard({ onSubmit, isLoading }: CreateEventWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateEventFormData>({
    defaultValues: {
      registrationRules: {
        teamSize: { min: 1, max: 4 },
        autoApprove: true,
      },
      paymentConfig: {
        isFree: true,
      },
    },
  })

  const formData = watch()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          setPreviewImage(event.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateAIDescription = async () => {
    setIsGeneratingAI(true)
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const descriptions = [
      `Join us for ${formData.title || 'an exciting event'} - the ultimate experience for tech enthusiasts! This ${formData.category || 'event'} brings together innovators, developers, and creators for an unforgettable journey. Network with industry leaders, showcase your skills, and compete for amazing prizes. Whether you're a seasoned professional or just starting out, there's something for everyone. Don't miss this opportunity to learn, grow, and connect with like-minded individuals!`,
    ]
    
    setValue('description', descriptions[0])
    setIsGeneratingAI(false)
  }

  const addTag = () => {
    if (newTag && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag])
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag))
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleFormSubmit = async (data: CreateEventFormData) => {
    await onSubmit({ ...data, tags: selectedTags })
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{
                    scale: currentStep === step.id ? 1.1 : 1,
                    backgroundColor: currentStep >= step.id 
                      ? 'var(--primary)' 
                      : 'var(--muted)',
                  }}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                    currentStep >= step.id ? 'text-primary-foreground' : 'text-muted-foreground'
                  )}
                >
                  {currentStep > step.id ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Check className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </motion.div>
                <span className={cn(
                  'text-xs mt-2 font-medium',
                  currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-muted relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: currentStep > step.id ? '100%' : '0%' }}
                    className="absolute inset-y-0 left-0 bg-primary"
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <AnimatePresence mode="wait">
          {/* Step 1: Basics */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., HackOverflow 2026"
                  {...register('title', { required: 'Title is required' })}
                  className={cn(errors.title && 'border-destructive')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select onValueChange={(v) => setValue('category', v as EventCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Start Date & Time</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    {...register('date', { required: 'Date is required' })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date & Time</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    {...register('endDate')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="venue"
                    placeholder="e.g., Tech Hub, Building A"
                    className="pl-10"
                    {...register('venue', { required: 'Venue is required' })}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateAIDescription}
                    disabled={isGeneratingAI}
                    className="gap-2"
                  >
                    {isGeneratingAI ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles className="h-4 w-4" />
                        </motion.div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  id="description"
                  placeholder="Describe your event..."
                  rows={6}
                  {...register('description', { required: 'Description is required' })}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Banner Image</Label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={cn(
                    'relative border-2 border-dashed rounded-xl p-8 text-center transition-colors',
                    dragActive ? 'border-primary bg-primary/5' : 'border-border',
                    previewImage && 'p-0 border-solid'
                  )}
                >
                  {previewImage ? (
                    <div className="relative aspect-video">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => setPreviewImage(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag and drop an image, or click to browse
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="secondary">
                    Add
                  </Button>
                </div>
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Rules */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Team Size */}
              <div className="space-y-4">
                <Label>Team Size</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Minimum</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      defaultValue={1}
                      {...register('registrationRules.teamSize.min')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Maximum</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      defaultValue={4}
                      {...register('registrationRules.teamSize.max')}
                    />
                  </div>
                </div>
              </div>

              {/* CGPA Requirement */}
              <div className="space-y-4">
                <Label>Minimum CGPA (Optional)</Label>
                <Slider
                  defaultValue={[0]}
                  max={10}
                  step={0.5}
                  onValueChange={(value) => setValue('registrationRules.minCGPA', value[0])}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.registrationRules?.minCGPA || 0} CGPA
                </p>
              </div>

              {/* Allowed Branches */}
              <div className="space-y-2">
                <Label>Allowed Branches (Optional)</Label>
                <Select onValueChange={(v) => setValue('registrationRules.allowedBranches', [v])}>
                  <SelectTrigger>
                    <SelectValue placeholder="All branches allowed" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Auto Approve */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Auto-approve registrations</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve eligible participants
                  </p>
                </div>
                <Switch
                  checked={formData.registrationRules?.autoApprove}
                  onCheckedChange={(checked) => setValue('registrationRules.autoApprove', checked)}
                />
              </div>

              {/* Payment */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">Free Event</p>
                    <p className="text-sm text-muted-foreground">
                      No registration fee required
                    </p>
                  </div>
                  <Switch
                    checked={formData.paymentConfig?.isFree}
                    onCheckedChange={(checked) => setValue('paymentConfig.isFree', checked)}
                  />
                </div>

                {!formData.paymentConfig?.isFree && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label>Registration Fee</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="500"
                        className="pl-10"
                        {...register('paymentConfig.amount')}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Max Participants */}
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Maximum Participants (Optional)</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  placeholder="Leave empty for unlimited"
                  {...register('maxParticipants')}
                />
              </div>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                <h3 className="text-xl font-bold">{formData.title || 'Event Title'}</h3>
                
                <div className="flex flex-wrap gap-2">
                  {formData.category && (
                    <Badge>{formData.category.replace('-', ' ')}</Badge>
                  )}
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                
                <p className="text-muted-foreground">{formData.description || 'No description yet'}</p>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    {formData.date ? new Date(formData.date).toLocaleDateString() : 'Date not set'}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    {formData.venue || 'Venue not set'}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-primary" />
                    Team: {formData.registrationRules?.teamSize?.min || 1} - {formData.registrationRules?.teamSize?.max || 4} members
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <IndianRupee className="h-4 w-4 text-primary" />
                    {formData.paymentConfig?.isFree ? 'Free' : `₹${formData.paymentConfig?.amount || 0}`}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < 4 ? (
            <Button type="button" onClick={nextStep}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="gradient-primary text-primary-foreground border-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
              ) : (
                <>
                  Create Event
                  <Check className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
