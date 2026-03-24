'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, User, Building2, GraduationCap, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { branches, colleges, years } from '@/lib/mock-data'
import type { SignupFormData } from '@/lib/types'

interface SignupFormProps {
  onSubmit: (data: SignupFormData) => Promise<void>
  onSwitchToLogin: () => void
  isLoading?: boolean
}

const passwordCriteria = [
  { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number', test: (p: string) => /[0-9]/.test(p) },
]

export function SignupForm({ onSubmit, onSwitchToLogin, isLoading }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupFormData>({
    defaultValues: {
      role: 'participant',
      year: 1,
      cgpa: 7.0,
    },
  })

  const password = watch('password') || ''
  
  const passwordStrength = useMemo(() => {
    const passed = passwordCriteria.filter(c => c.test(password)).length
    return {
      score: passed,
      percentage: (passed / passwordCriteria.length) * 100,
      label: passed === 0 ? '' : passed <= 2 ? 'Weak' : passed === 3 ? 'Good' : 'Strong',
      color: passed <= 2 ? 'bg-destructive' : passed === 3 ? 'bg-warning' : 'bg-success',
    }
  }, [password])

  const handleFormSubmit = async (data: SignupFormData) => {
    await onSubmit(data)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Create Account</h2>
        <p className="text-muted-foreground">
          Join EventFlex to create and discover amazing events
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* Name Field */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              placeholder="John Doe"
              className={cn('pl-10', errors.name && 'border-destructive')}
              {...register('name', { required: 'Name is required' })}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <X className="h-3 w-3" />
              {errors.name.message}
            </p>
          )}
        </motion.div>

        {/* Email Field */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-2"
        >
          <Label htmlFor="signup-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="signup-email"
              type="email"
              placeholder="you@university.edu"
              className={cn('pl-10', errors.email && 'border-destructive')}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <X className="h-3 w-3" />
              {errors.email.message}
            </p>
          )}
        </motion.div>

        {/* Role Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label>I want to</Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'organizer', label: 'Organize Events', icon: '📅' },
              { value: 'participant', label: 'Join Events', icon: '🎯' },
            ].map((option) => (
              <motion.button
                key={option.value}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setValue('role', option.value as 'organizer' | 'participant')}
                className={cn(
                  'p-3 rounded-lg border text-left transition-all',
                  watch('role') === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <span className="text-lg mb-1 block">{option.icon}</span>
                <span className="text-sm font-medium">{option.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* College & Branch */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="space-y-2">
            <Label>College</Label>
            <Select onValueChange={(v) => setValue('college', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select college" />
              </SelectTrigger>
              <SelectContent>
                {colleges.map((college) => (
                  <SelectItem key={college} value={college}>
                    {college}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Branch</Label>
            <Select onValueChange={(v) => setValue('branch', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
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
        </motion.div>

        {/* Year & CGPA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="space-y-2">
            <Label>Year</Label>
            <Select onValueChange={(v) => setValue('year', parseInt(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    Year {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cgpa">CGPA</Label>
            <Input
              id="cgpa"
              type="number"
              step="0.1"
              min="0"
              max="10"
              placeholder="8.5"
              {...register('cgpa', {
                required: 'CGPA is required',
                min: { value: 0, message: 'Invalid CGPA' },
                max: { value: 10, message: 'Invalid CGPA' },
              })}
            />
          </div>
        </motion.div>

        {/* Password Field */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-2"
        >
          <Label htmlFor="signup-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              className="pl-10 pr-10"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          {/* Password Strength */}
          {password.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${passwordStrength.percentage}%` }}
                    className={cn('h-full rounded-full transition-colors', passwordStrength.color)}
                  />
                </div>
                <span className={cn(
                  'text-xs font-medium',
                  passwordStrength.score <= 2 ? 'text-destructive' : 
                  passwordStrength.score === 3 ? 'text-warning' : 'text-success'
                )}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {passwordCriteria.map((criteria) => (
                  <motion.div
                    key={criteria.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      'flex items-center gap-1 text-xs',
                      criteria.test(password) ? 'text-success' : 'text-muted-foreground'
                    )}
                  >
                    {criteria.test(password) ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    {criteria.label}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Confirm Password */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              className={cn('pl-10 pr-10', errors.confirmPassword && 'border-destructive')}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <X className="h-3 w-3" />
              {errors.confirmPassword.message}
            </p>
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Button
            type="submit"
            className="w-full gradient-primary text-primary-foreground border-0"
            disabled={isLoading}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
              />
            ) : (
              'Create Account'
            )}
          </Button>
        </motion.div>
      </form>

      {/* Switch to Login */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary hover:underline font-medium"
        >
          Sign in
        </button>
      </p>
    </motion.div>
  )

  // mynameisishu
}
