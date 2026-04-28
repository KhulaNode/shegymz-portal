export type MembershipLookupResult =
  | {
      isActive: true;
      matchedEmail: string;
      providerReference?: string;
    }
  | {
      isActive: false;
      matchedEmail: string;
      reason: 'not_found' | 'inactive' | 'provider_error';
    };

interface PaystackTransactionListResponse {
  status: boolean;
  message: string;
  data?: Array<{
    status?: string;
    reference?: string;
    customer?: {
      email?: string;
    };
    plan_object?: {
      plan_code?: string;
    };
  }>;
}

interface PaystackCustomerResponse {
  status: boolean;
  message: string;
  data?: {
    email?: string;
    subscriptions?: Array<{
      status?: string;
      subscription_code?: string;
      plan?: {
        plan_code?: string;
      };
    }>;
  };
}

const PAYSTACK_API_BASE = 'https://api.paystack.co';

export async function lookupActiveMembershipByEmail(
  email: string,
): Promise<MembershipLookupResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY ?? '';
  const planCode = process.env.PAYSTACK_PLAN_CODE?.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!secretKey) {
    return {
      isActive: false,
      matchedEmail: normalizedEmail,
      reason: 'provider_error',
    };
  }

  try {
    const customerResponse = await fetch(
      `${PAYSTACK_API_BASE}/customer/${encodeURIComponent(normalizedEmail)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
        cache: 'no-store',
      },
    );

    const customerPayload = (await customerResponse.json().catch(() => ({}))) as PaystackCustomerResponse;
    if (!customerResponse.ok || !customerPayload.status || !customerPayload.data) {
      return {
        isActive: false,
        matchedEmail: normalizedEmail,
        reason: 'provider_error',
      };
    }

    const subscriptions = customerPayload.data.subscriptions ?? [];
    const activeSubscription = subscriptions.find((subscription) => {
      const statusMatch = subscription.status === 'active';
      const providerPlanCode = subscription.plan?.plan_code;
      const planMatch = planCode ? !providerPlanCode || providerPlanCode === planCode : true;
      return statusMatch && planMatch;
    });

    if (activeSubscription) {
      return {
        isActive: true,
        matchedEmail: normalizedEmail,
        providerReference: activeSubscription.subscription_code,
      };
    }

    const transactionResponse = await fetch(
      `${PAYSTACK_API_BASE}/transaction?perPage=50&status=success`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
        cache: 'no-store',
      },
    );

    const transactionPayload = (await transactionResponse.json().catch(() => ({}))) as PaystackTransactionListResponse;
    if (!transactionResponse.ok || !transactionPayload.status || !transactionPayload.data) {
      return {
        isActive: false,
        matchedEmail: normalizedEmail,
        reason: 'provider_error',
      };
    }

    const successfulTransaction = transactionPayload.data.find((entry) => {
      const sameEmail = entry.customer?.email?.trim().toLowerCase() === normalizedEmail;
      const statusMatch = entry.status === 'success';
      const planMatch = planCode ? entry.plan_object?.plan_code === planCode : true;
      return sameEmail && statusMatch && planMatch;
    });

    if (!successfulTransaction) {
      return {
        isActive: false,
        matchedEmail: normalizedEmail,
        reason: 'not_found',
      };
    }

    return {
      isActive: true,
      matchedEmail: normalizedEmail,
      providerReference: successfulTransaction.reference,
    };
  } catch {
    return {
      isActive: false,
      matchedEmail: normalizedEmail,
      reason: 'provider_error',
    };
  }
}
