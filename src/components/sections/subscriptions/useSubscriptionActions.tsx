import { useState } from 'react';
import { parseApiError } from 'lib/api';
import { subscriptionService } from 'services/subscriptionService';
import { Subscription } from 'types/subscriptions';

// The two things staff can do to a subscription (refresh it from Razorpay, cancel it at the end of the period),
// shared by the subscriptions list and the school's subscription tab.
const useSubscriptionActions = (onDone: (message: string) => void) => {
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState<Subscription | null>(null);
  const [working, setWorking] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const sync = async (subscription: Subscription) => {
    setError('');
    try {
      await subscriptionService.sync(subscription.uuid);
      onDone('Refreshed from Razorpay.');
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  const confirmCancel = async () => {
    if (!cancelling) return;
    setWorking(true);
    setCancelError('');
    try {
      await subscriptionService.cancel(cancelling.uuid);
      setCancelling(null);
      onDone('Cancellation saved.');
    } catch (err) {
      setCancelError(parseApiError(err).message);
    }
    setWorking(false);
  };

  const askCancel = (subscription: Subscription) => {
    setCancelError('');
    setCancelling(subscription);
  };

  return {
    error,
    setError,
    sync,
    cancelling,
    askCancel,
    closeCancel: () => setCancelling(null),
    confirmCancel,
    working,
    cancelError,
  };
};

export default useSubscriptionActions;
