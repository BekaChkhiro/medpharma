/**
 * Checkout store using Zustand with sessionStorage persistence
 * Manages multi-step checkout state: personal info, delivery, payment, review
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

// Checkout step types
export type CheckoutStep = 'info' | 'delivery' | 'payment' | 'review';

// Personal info form data (Step 1)
export interface PersonalInfoData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// Delivery info form data (Step 2)
export interface DeliveryInfoData {
  deliveryZoneId: string;
  zoneName: string; // Store for display
  address: string;
  notes: string;
  deliveryFee: number;
  freeAbove: number | null;
}

// Payment method options
export type PaymentMethod = 'tbc' | 'bog' | 'cash';

// Payment info form data (Step 3)
export interface PaymentInfoData {
  method: PaymentMethod;
}

// Complete checkout data
export interface CheckoutData {
  personalInfo: PersonalInfoData | null;
  deliveryInfo: DeliveryInfoData | null;
  paymentInfo: PaymentInfoData | null;
}

// Checkout state interface
interface CheckoutState {
  currentStep: CheckoutStep;
  data: CheckoutData;
  completedSteps: CheckoutStep[];
}

// Checkout actions interface
interface CheckoutActions {
  // Step navigation
  setStep: (step: CheckoutStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  canGoToStep: (step: CheckoutStep) => boolean;

  // Data setters
  setPersonalInfo: (data: PersonalInfoData) => void;
  setDeliveryInfo: (data: DeliveryInfoData) => void;
  setPaymentInfo: (data: PaymentInfoData) => void;

  // Utilities
  resetCheckout: () => void;
  getStepIndex: (step: CheckoutStep) => number;
  isStepCompleted: (step: CheckoutStep) => boolean;
  getCompletedData: () => CheckoutData;
}

// Combined store type
export type CheckoutStore = CheckoutState & CheckoutActions;

// Step order for navigation
const STEP_ORDER: CheckoutStep[] = ['info', 'delivery', 'payment', 'review'];

// Initial state
const initialState: CheckoutState = {
  currentStep: 'info',
  data: {
    personalInfo: null,
    deliveryInfo: null,
    paymentInfo: null,
  },
  completedSteps: [],
};

// Create the checkout store with persist middleware
export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      // State
      ...initialState,

      // Get step index
      getStepIndex: (step: CheckoutStep) => STEP_ORDER.indexOf(step),

      // Set current step
      setStep: (step: CheckoutStep) => {
        const { canGoToStep } = get();
        if (canGoToStep(step)) {
          set({ currentStep: step });
        }
      },

      // Navigate to next step
      nextStep: () => {
        const { currentStep, getStepIndex } = get();
        const currentIndex = getStepIndex(currentStep);
        if (currentIndex < STEP_ORDER.length - 1) {
          set({ currentStep: STEP_ORDER[currentIndex + 1] });
        }
      },

      // Navigate to previous step
      previousStep: () => {
        const { currentStep, getStepIndex } = get();
        const currentIndex = getStepIndex(currentStep);
        if (currentIndex > 0) {
          set({ currentStep: STEP_ORDER[currentIndex - 1] });
        }
      },

      // Check if can navigate to a specific step
      canGoToStep: (step: CheckoutStep) => {
        const { completedSteps, getStepIndex, currentStep } = get();
        const targetIndex = getStepIndex(step);
        const currentIndex = getStepIndex(currentStep);

        // Can always go back
        if (targetIndex <= currentIndex) return true;

        // Can go forward only if all previous steps are completed
        for (let i = 0; i < targetIndex; i++) {
          if (!completedSteps.includes(STEP_ORDER[i])) {
            return false;
          }
        }
        return true;
      },

      // Check if step is completed
      isStepCompleted: (step: CheckoutStep) => {
        const { completedSteps } = get();
        return completedSteps.includes(step);
      },

      // Set personal info (Step 1)
      setPersonalInfo: (data: PersonalInfoData) => {
        set((state) => ({
          data: { ...state.data, personalInfo: data },
          completedSteps: state.completedSteps.includes('info')
            ? state.completedSteps
            : [...state.completedSteps, 'info'],
        }));
      },

      // Set delivery info (Step 2)
      setDeliveryInfo: (data: DeliveryInfoData) => {
        set((state) => ({
          data: { ...state.data, deliveryInfo: data },
          completedSteps: state.completedSteps.includes('delivery')
            ? state.completedSteps
            : [...state.completedSteps, 'delivery'],
        }));
      },

      // Set payment info (Step 3)
      setPaymentInfo: (data: PaymentInfoData) => {
        set((state) => ({
          data: { ...state.data, paymentInfo: data },
          completedSteps: state.completedSteps.includes('payment')
            ? state.completedSteps
            : [...state.completedSteps, 'payment'],
        }));
      },

      // Reset checkout to initial state
      resetCheckout: () => {
        set(initialState);
      },

      // Get all completed checkout data
      getCompletedData: () => {
        const { data } = get();
        return data;
      },
    }),
    {
      name: 'medpharma-checkout',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

// Selector hooks for optimized re-renders
export const useCurrentStep = () => useCheckoutStore((state) => state.currentStep);
export const useCheckoutData = () => useCheckoutStore((state) => state.data);
export const useCompletedSteps = () => useCheckoutStore((state) => state.completedSteps);

// Personal info selectors
export const usePersonalInfo = () => useCheckoutStore((state) => state.data.personalInfo);

// Delivery info selectors
export const useDeliveryInfo = () => useCheckoutStore((state) => state.data.deliveryInfo);

// Payment info selectors
export const usePaymentInfo = () => useCheckoutStore((state) => state.data.paymentInfo);

// Actions hooks
export const useCheckoutActions = () =>
  useCheckoutStore(
    useShallow((state) => ({
      setStep: state.setStep,
      nextStep: state.nextStep,
      previousStep: state.previousStep,
      canGoToStep: state.canGoToStep,
      setPersonalInfo: state.setPersonalInfo,
      setDeliveryInfo: state.setDeliveryInfo,
      setPaymentInfo: state.setPaymentInfo,
      resetCheckout: state.resetCheckout,
      isStepCompleted: state.isStepCompleted,
      getCompletedData: state.getCompletedData,
    }))
  );

// Export step order for use in components
export { STEP_ORDER };
