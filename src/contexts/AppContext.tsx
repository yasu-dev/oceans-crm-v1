import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Customer } from '../types/customer';
import { Visit } from '../types/visit';
import { Appointment } from '../types/appointment';
import { mockCustomers, mockVisits, mockAppointments } from '../data/mockData';
import { calculateCustomerStatus, calculateLossAmount, getImportantSegments } from '../utils/customerAnalytics';
import { useAuth } from './AuthContext';

interface AppContextType {
  customers: Customer[];
  visits: Visit[];
  appointments: Appointment[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  addVisit: (visit: Visit) => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  todayVisitCount: number;
  todayVisitTarget: number;
  followUpCount: number;
  followUpCompleted: number;
  monthlyLossAmount: number;
  isLoading: boolean;
  importantSegments: {
    twoMonthsNoVisit: Customer[];
    lastMonthNoFollow: Customer[];
    repeatingNoReservation: Customer[];
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  
  // Load initial data
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    
    setTimeout(() => {
      setCustomers(mockCustomers);
      setVisits(mockVisits);
      setAppointments(mockAppointments);
      setIsLoading(false);
    }, 1000);
  }, [isAuthenticated]);
  
  // Calculate dashboard metrics
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.startTime);
    const todayDate = new Date();
    return aptDate.toDateString() === todayDate.toDateString() && apt.status === 'scheduled';
  });
  
  const todayVisitCount = todayAppointments.length;
  const todayVisitTarget = 15; // This would come from settings in a real app
  
  const followUpCount = customers.filter(c => {
    const status = calculateCustomerStatus(c, visits);
    return status === 'last-month-visited' || 
           status === 'two-months-no-visit' || 
           status === 'three-months-no-visit';
  }).length;
  
  const followUpCompleted = Math.floor(followUpCount * 0.7); // Mock data
  
  const monthlyLossAmount = customers.reduce((total, customer) => {
    return total + calculateLossAmount(customer, visits);
  }, 0);
  
  // Get important segments
  const importantSegments = getImportantSegments(customers, visits);
  
  const addCustomer = (customer: Customer) => {
    setCustomers(prev => [...prev, customer]);
  };
  
  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };
  
  const addVisit = (visit: Visit) => {
    setVisits(prev => [...prev, visit]);
  };
  
  const addAppointment = (appointment: Appointment) => {
    setAppointments(prev => [...prev, appointment]);
  };
  
  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => 
      a.id === id ? { ...a, ...updates } : a
    ));
  };
  
  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };
  
  return (
    <AppContext.Provider value={{
      customers,
      visits,
      appointments,
      addCustomer,
      updateCustomer,
      addVisit,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      todayVisitCount,
      todayVisitTarget,
      followUpCount,
      followUpCompleted,
      monthlyLossAmount,
      isLoading,
      importantSegments,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}