declare module '@paystack/inline-js' {
    interface PaystackOptions {
        key: string
        email: string
        amount: number
        currency?: string
        reference?: string
        metadata?: Record<string, any>
        onSuccess?: (transaction: { reference: string;[key: string]: any }) => void
        onCancel?: () => void
        onClose?: () => void
    }

    class PaystackPop {
        newTransaction(options: PaystackOptions): void
    }

    export default PaystackPop
}
