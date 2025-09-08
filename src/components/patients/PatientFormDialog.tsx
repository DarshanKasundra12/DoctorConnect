import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Save, User, Heart, Activity, Stethoscope } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';

interface PatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingPatient?: any;
}

const PatientFormDialog = ({ isOpen, onClose, onSuccess, editingPatient }: PatientFormProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    full_name: editingPatient?.full_name || '',
    gender: editingPatient?.gender || '',
    weight: editingPatient?.weight || '',
    height: editingPatient?.height || '',
    phone: editingPatient?.phone || '',
    email: editingPatient?.email || '',
    address: editingPatient?.address || '',
    emergency_contact: editingPatient?.emergency_contact || '',
    
    // Medical Details
    chief_complaint: editingPatient?.chief_complaint || '',
    diagnosis: editingPatient?.diagnosis || '',
    medical_history: editingPatient?.medical_history || '',
    drug_history: editingPatient?.drug_history || '',
    anesthesia_history: editingPatient?.anesthesia_history || '',
    allergies: editingPatient?.allergies || '',
    
    // Vitals & Lab Values
    temperature: editingPatient?.temperature || '',
    pulse: editingPatient?.pulse || '',
    blood_pressure: editingPatient?.blood_pressure || '',
    respiration: editingPatient?.respiration || '',
    hemoglobin_percentage: editingPatient?.hemoglobin_percentage || '',
    blood_group: editingPatient?.blood_group || '',
    random_blood_sugar: editingPatient?.random_blood_sugar || '',
    blood_urea: editingPatient?.blood_urea || '',
    serum_creatinine: editingPatient?.serum_creatinine || '',
    asa_classification: editingPatient?.asa_classification || '',
    
    // Examination & Investigations
    respiratory_system: editingPatient?.respiratory_system || '',
    cardiovascular: editingPatient?.cardiovascular || '',
    abdomen: editingPatient?.abdomen || '',
    central_nervous_system: editingPatient?.central_nervous_system || '',
    ecg: editingPatient?.ecg || '',
    chest_xray: editingPatient?.chest_xray || '',
    other_investigations: editingPatient?.other_investigations || '',
  });

  const steps = [
    { number: 1, title: 'Basic Info', icon: User },
    { number: 2, title: 'Medical Details', icon: Heart },
    { number: 3, title: 'Vitals & Lab Values', icon: Activity },
    { number: 4, title: 'Examination & Investigations', icon: Stethoscope },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.full_name.trim() !== '';
      case 2:
        return true; // Medical details are optional for now
      case 3:
        return true; // Vitals are optional for now
      case 4:
        return true; // Examination details are optional for now
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill in the required fields before continuing.",
        variant: "destructive"
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const patientData = {
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        pulse: formData.pulse ? parseInt(formData.pulse) : null,
        respiration: formData.respiration ? parseInt(formData.respiration) : null,
        hemoglobin_percentage: formData.hemoglobin_percentage ? parseFloat(formData.hemoglobin_percentage) : null,
        random_blood_sugar: formData.random_blood_sugar ? parseFloat(formData.random_blood_sugar) : null,
        blood_urea: formData.blood_urea ? parseFloat(formData.blood_urea) : null,
        serum_creatinine: formData.serum_creatinine ? parseFloat(formData.serum_creatinine) : null,
        user_id: user.id,
      };

      if (editingPatient) {
        const { error } = await supabase
          .from('patients')
          .update(patientData)
          .eq('id', editingPatient.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast({ title: "Success", description: "Patient updated successfully" });
      } else {
        const { error } = await supabase
          .from('patients')
          .insert([patientData]);

        if (error) throw error;
        toast({ title: "Success", description: "Patient created successfully" });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="emergency_contact">Emergency Contact</Label>
              <Input
                id="emergency_contact"
                value={formData.emergency_contact}
                onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="chief_complaint">Chief Complaint</Label>
              <Textarea
                id="chief_complaint"
                value={formData.chief_complaint}
                onChange={(e) => handleInputChange('chief_complaint', e.target.value)}
                placeholder="Patient's main concern or symptom"
              />
            </div>

            <div>
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                value={formData.diagnosis}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                placeholder="Medical diagnosis"
              />
            </div>

            <div>
              <Label htmlFor="medical_history">Medical History</Label>
              <Textarea
                id="medical_history"
                value={formData.medical_history}
                onChange={(e) => handleInputChange('medical_history', e.target.value)}
                placeholder="Past medical conditions, surgeries, etc."
              />
            </div>

            <div>
              <Label htmlFor="drug_history">Drug History</Label>
              <Textarea
                id="drug_history"
                value={formData.drug_history}
                onChange={(e) => handleInputChange('drug_history', e.target.value)}
                placeholder="Current and past medications"
              />
            </div>

            <div>
              <Label htmlFor="anesthesia_history">Anesthesia History</Label>
              <Textarea
                id="anesthesia_history"
                value={formData.anesthesia_history}
                onChange={(e) => handleInputChange('anesthesia_history', e.target.value)}
                placeholder="Previous anesthesia experiences"
              />
            </div>

            <div>
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="Known allergies and reactions"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange('temperature', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="pulse">Pulse (bpm)</Label>
                <Input
                  id="pulse"
                  type="number"
                  value={formData.pulse}
                  onChange={(e) => handleInputChange('pulse', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="blood_pressure">Blood Pressure</Label>
                <Input
                  id="blood_pressure"
                  value={formData.blood_pressure}
                  onChange={(e) => handleInputChange('blood_pressure', e.target.value)}
                  placeholder="e.g., 120/80"
                />
              </div>
              <div>
                <Label htmlFor="respiration">Respiration (per min)</Label>
                <Input
                  id="respiration"
                  type="number"
                  value={formData.respiration}
                  onChange={(e) => handleInputChange('respiration', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hemoglobin_percentage">Hemoglobin %</Label>
                <Input
                  id="hemoglobin_percentage"
                  type="number"
                  step="0.1"
                  value={formData.hemoglobin_percentage}
                  onChange={(e) => handleInputChange('hemoglobin_percentage', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="blood_group">Blood Group</Label>
                <Select value={formData.blood_group} onValueChange={(value) => handleInputChange('blood_group', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="random_blood_sugar">RBS (mg/dL)</Label>
                <Input
                  id="random_blood_sugar"
                  type="number"
                  value={formData.random_blood_sugar}
                  onChange={(e) => handleInputChange('random_blood_sugar', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="blood_urea">Blood Urea</Label>
                <Input
                  id="blood_urea"
                  type="number"
                  step="0.1"
                  value={formData.blood_urea}
                  onChange={(e) => handleInputChange('blood_urea', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="serum_creatinine">Serum Creatinine</Label>
                <Input
                  id="serum_creatinine"
                  type="number"
                  step="0.1"
                  value={formData.serum_creatinine}
                  onChange={(e) => handleInputChange('serum_creatinine', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="asa_classification">ASA Classification</Label>
              <Select value={formData.asa_classification} onValueChange={(value) => handleInputChange('asa_classification', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ASA classification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASA I">ASA I - Normal healthy patient</SelectItem>
                  <SelectItem value="ASA II">ASA II - Mild systemic disease</SelectItem>
                  <SelectItem value="ASA III">ASA III - Severe systemic disease</SelectItem>
                  <SelectItem value="ASA IV">ASA IV - Life-threatening disease</SelectItem>
                  <SelectItem value="ASA V">ASA V - Moribund patient</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="respiratory_system">Respiratory System</Label>
                <Textarea
                  id="respiratory_system"
                  value={formData.respiratory_system}
                  onChange={(e) => handleInputChange('respiratory_system', e.target.value)}
                  placeholder="Respiratory examination findings"
                />
              </div>
              <div>
                <Label htmlFor="cardiovascular">Cardiovascular</Label>
                <Textarea
                  id="cardiovascular"
                  value={formData.cardiovascular}
                  onChange={(e) => handleInputChange('cardiovascular', e.target.value)}
                  placeholder="Cardiovascular examination findings"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="abdomen">Abdomen</Label>
                <Textarea
                  id="abdomen"
                  value={formData.abdomen}
                  onChange={(e) => handleInputChange('abdomen', e.target.value)}
                  placeholder="Abdominal examination findings"
                />
              </div>
              <div>
                <Label htmlFor="central_nervous_system">Central Nervous System</Label>
                <Textarea
                  id="central_nervous_system"
                  value={formData.central_nervous_system}
                  onChange={(e) => handleInputChange('central_nervous_system', e.target.value)}
                  placeholder="CNS examination findings"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ecg">ECG</Label>
              <Textarea
                id="ecg"
                value={formData.ecg}
                onChange={(e) => handleInputChange('ecg', e.target.value)}
                placeholder="ECG findings and interpretation"
              />
            </div>

            <div>
              <Label htmlFor="chest_xray">Chest X-Ray</Label>
              <Textarea
                id="chest_xray"
                value={formData.chest_xray}
                onChange={(e) => handleInputChange('chest_xray', e.target.value)}
                placeholder="Chest X-ray findings"
              />
            </div>

            <div>
              <Label htmlFor="other_investigations">Other Investigations</Label>
              <Textarea
                id="other_investigations"
                value={formData.other_investigations}
                onChange={(e) => handleInputChange('other_investigations', e.target.value)}
                placeholder="Other test results and investigations"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPatient ? 'Edit Patient' : 'Add New Patient'}
          </DialogTitle>
        </DialogHeader>

        {/* Step Progress */}
        <div className="flex justify-between mb-6">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            
            return (
              <div key={step.number} className="flex flex-col items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full mb-2
                  ${isActive ? 'bg-primary text-primary-foreground' : 
                    isCompleted ? 'bg-green-500 text-white' : 
                    'bg-muted text-muted-foreground'}
                `}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.title}
                  </p>
                  <Badge variant={isActive ? 'default' : 'outline'} className="text-xs">
                    {step.number}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5" })}
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < 4 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : editingPatient ? 'Update Patient' : 'Save Patient'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientFormDialog;