"use client"

import { useState, useEffect, useCallback } from "react"
import Joyride, { CallBackProps, EVENTS, STATUS, Step } from "react-joyride"
import { usePathname, useRouter } from "next/navigation"
import { TourTooltip } from "./tour-tooltip"
import { ownerSteps, memberSteps, ExtendedStep } from "./tour-steps"

interface ProductTourProps {
    user: any
    workspace: any
}

export function ProductTour({ user, workspace }: ProductTourProps) {
    const [run, setRun] = useState(false)
    const [steps, setSteps] = useState<ExtendedStep[]>([])
    const [stepIndex, setStepIndex] = useState(0)
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        // Check if tour is already completed
        const isTourCompleted = localStorage.getItem("ninja_tour_completed")
        if (isTourCompleted) return

        // Wait a bit for UI to load
        const timer = setTimeout(() => {
            const isOwner = workspace?.created_by === user?.id
            setSteps(isOwner ? ownerSteps : memberSteps)
            setRun(true)
        }, 1500)

        return () => clearTimeout(timer)
    }, [user, workspace])

    // Handle Navigation and Step Changes
    const handleJoyrideCallback = useCallback((data: CallBackProps) => {
        const { action, index, status, type, step } = data
        const currentStep = step as ExtendedStep

        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

        if (finishedStatuses.includes(status)) {
            setRun(false)
            localStorage.setItem("ninja_tour_completed", "true")
            return
        }

        if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
            const nextIndex = index + (action === 'prev' ? -1 : 1)
            const nextStep = steps[nextIndex]

            if (nextStep && nextStep.route && nextStep.route !== pathname) {
                // Navigate to next page
                router.push(nextStep.route)
                setStepIndex(nextIndex)
            } else {
                setStepIndex(nextIndex)
            }
        }
    }, [pathname, router, steps])

    // Effect to handle route changes and resume tour
    useEffect(() => {
        if (run && steps[stepIndex]?.route === pathname) {
            // We are on the right page, ensure Joyride finds the target
        }
    }, [pathname, run, stepIndex, steps])


    if (!run) return null

    return (
        <Joyride
            steps={steps}
            run={run}
            stepIndex={stepIndex}
            continuous
            showSkipButton
            showProgress
            disableScrolling={false}
            tooltipComponent={TourTooltip}
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    zIndex: 9999,
                    primaryColor: '#a855f7',
                    textColor: '#fff',
                    overlayColor: 'rgba(0, 0, 0, 0.5)', // Standard overlay
                },
                spotlight: {
                    borderRadius: '10px', // Nice rounded corners
                }
            }}
            floaterProps={{
                disableAnimation: true, // Fix for positioning issues
            }}
        />
    )
}
