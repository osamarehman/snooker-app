"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AuthError } from '@supabase/supabase-js'
import { debounce } from "lodash"


import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
})

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const debouncedSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      const submit = async () => {
        try {
          setIsLoading(true)
          setError(null)
          
          const { error } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
          })

          if (error) {
            if (error.message.includes('rate limit')) {
              throw new Error('Please wait a moment before trying again')
            }
            throw error
          }

          router.push('/')
          router.refresh()

        } catch (error) {
          if (error instanceof AuthError) {
            setError(error?.message)
          } else {
            setError("Failed to Login")
          }
        } finally {
          setIsLoading(false)
        }
      }
      
      // Debounce the submit function
      debounce(submit, 1000)()
    },
    [router, supabase.auth, setError, setIsLoading]
  )

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const values = form.getValues()
    debouncedSubmit(values)
  }, [debouncedSubmit, form])

  return (
    <Form {...form}>
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Enter your password" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              className="text-sm text-red-500"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Forgot password?
          </Link>
        </div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                Logging in...
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                Log in
              </motion.div>
            )}
          </Button>
        </motion.div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Don&lsquo;t have an account?
            </span>
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Link
            href="/auth/signup"
            className="inline-flex w-full justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold transition-colors hover:bg-slate-100"
          >
            Create an account
          </Link>
        </motion.div>
      </motion.form>
    </Form>
  )
}
