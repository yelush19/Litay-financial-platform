import { useState } from 'react';
import { X, Check, Building2, Users, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Input } from '@/shared/components/ui';

interface TenantData {
  // Step 1: Company details
  name: string;
  slug: string;
  companyId: string; // ח.פ.
  email: string;
  phone: string;
  address: string;
  // Step 2: Users
  users: UserData[];
  // Step 3: Files uploaded
  filesUploaded: boolean;
}

interface UserData {
  email: string;
  fullName: string;
  role: 'admin' | 'viewer';
}

interface CreateTenantWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: TenantData) => Promise<void>;
}

const STEPS = [
  { id: 1, title: 'פרטי לקוח', icon: Building2 },
  { id: 2, title: 'משתמשים', icon: Users },
  { id: 3, title: 'העלאת נתונים', icon: Upload },
];

export function CreateTenantWizard({ isOpen, onClose, onComplete }: CreateTenantWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<TenantData>({
    name: '',
    slug: '',
    companyId: '',
    email: '',
    phone: '',
    address: '',
    users: [{ email: '', fullName: '', role: 'admin' }],
    filesUploaded: false,
  });

  if (!isOpen) return null;

  const updateData = (updates: Partial<TenantData>) => {
    setData({ ...data, ...updates });
  };

  const updateUser = (index: number, updates: Partial<UserData>) => {
    const newUsers = [...data.users];
    newUsers[index] = { ...newUsers[index], ...updates };
    setData({ ...data, users: newUsers });
  };

  const addUser = () => {
    setData({
      ...data,
      users: [...data.users, { email: '', fullName: '', role: 'viewer' }],
    });
  };

  const removeUser = (index: number) => {
    if (data.users.length > 1) {
      setData({
        ...data,
        users: data.users.filter((_, i) => i !== index),
      });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.name && data.slug;
      case 2:
        return data.users.some((u) => u.email && u.fullName);
      case 3:
        return true; // Can skip file upload
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(data);
      onClose();
    } catch (error) {
      console.error('Failed to create tenant:', error);
    }
    setIsSubmitting(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">הקמת לקוח חדש</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                    </div>
                    <span
                      className={`font-medium ${
                        isActive ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-16 h-0.5 mx-4 ${
                        currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {/* Step 1: Company Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="שם חברה *"
                  value={data.name}
                  onChange={(e) => {
                    updateData({
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  placeholder="שם החברה"
                />
                <Input
                  label="מזהה (Slug) *"
                  value={data.slug}
                  onChange={(e) =>
                    updateData({ slug: generateSlug(e.target.value) })
                  }
                  placeholder="company-name"
                  helperText="ישמש בכתובת URL"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="ח.פ. / ע.מ."
                  value={data.companyId}
                  onChange={(e) => updateData({ companyId: e.target.value })}
                  placeholder="123456789"
                />
                <Input
                  label="אימייל"
                  type="email"
                  value={data.email}
                  onChange={(e) => updateData({ email: e.target.value })}
                  placeholder="contact@company.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="טלפון"
                  value={data.phone}
                  onChange={(e) => updateData({ phone: e.target.value })}
                  placeholder="03-1234567"
                />
                <Input
                  label="כתובת"
                  value={data.address}
                  onChange={(e) => updateData({ address: e.target.value })}
                  placeholder="רחוב, עיר"
                />
              </div>
            </div>
          )}

          {/* Step 2: Users */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                הוסף משתמשים שיוכלו לגשת לנתוני הלקוח. הם יקבלו הזמנה במייל.
              </p>

              {data.users.map((user, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      משתמש {index + 1}
                    </span>
                    {data.users.length > 1 && (
                      <button
                        onClick={() => removeUser(index)}
                        className="text-red-500 text-sm hover:underline"
                      >
                        הסר
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="שם מלא *"
                      value={user.fullName}
                      onChange={(e) =>
                        updateUser(index, { fullName: e.target.value })
                      }
                      placeholder="ישראל ישראלי"
                    />
                    <Input
                      label="אימייל *"
                      type="email"
                      value={user.email}
                      onChange={(e) =>
                        updateUser(index, { email: e.target.value })
                      }
                      placeholder="user@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      הרשאה
                    </label>
                    <select
                      value={user.role}
                      onChange={(e) =>
                        updateUser(index, {
                          role: e.target.value as 'admin' | 'viewer',
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    >
                      <option value="admin">מנהל - צפייה ועריכה</option>
                      <option value="viewer">צופה - צפייה בלבד</option>
                    </select>
                  </div>
                </div>
              ))}

              <button
                onClick={addUser}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition"
              >
                + הוסף משתמש נוסף
              </button>
            </div>
          )}

          {/* Step 3: File Upload */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                העלה קבצי Excel עם נתונים חשבונאיים. ניתן גם לדלג ולהעלות מאוחר יותר.
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[var(--color-primary)] transition cursor-pointer">
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  גרור קבצים לכאן או לחץ לבחירה
                </p>
                <p className="text-sm text-gray-400">
                  Excel, CSV (עד 10MB לקובץ)
                </p>
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  multiple
                  onChange={() => updateData({ filesUploaded: true })}
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <input
                  type="checkbox"
                  id="skipUpload"
                  checked={!data.filesUploaded}
                  onChange={() => updateData({ filesUploaded: false })}
                  className="rounded"
                />
                <label htmlFor="skipUpload">אעלה נתונים מאוחר יותר</label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronRight size={18} />
            הקודם
          </Button>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              ביטול
            </Button>

            {currentStep < 3 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                הבא
                <ChevronLeft size={18} />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                isLoading={isSubmitting}
                disabled={!canProceed()}
              >
                <Check size={18} />
                סיים והקם לקוח
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
