import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const TransactionForm = ({ onSubmit, categories, initialData = null }) => {
	const [formData, setFormData] = useState({
		description: '',
		amount: '',
		type: 'EXPENSE',
		categoryId: '',
		date: new Date(),
	});

	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (initialData) {
			setFormData({
				description: initialData.description || '',
				amount: initialData.amount ? String(initialData.amount / 100) : '', // Convert cents to dollars for display
				type: initialData.type || 'EXPENSE',
				categoryId: initialData.category?.id || '',
				date: initialData.date ? new Date(initialData.date) : new Date(),
			});
		}
	}, [initialData]);

	const handleChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));

		// Clear error when field is updated
		if (errors[field]) {
			setErrors((prev) => ({
				...prev,
				[field]: null,
			}));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.description.trim()) {
			newErrors.description = 'Description is required';
		}

		if (!formData.amount) {
			newErrors.amount = 'Amount is required';
		} else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
			newErrors.amount = 'Amount must be a positive number';
		}

		if (!formData.date) {
			newErrors.date = 'Date is required';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			setIsSubmitting(true);

			// Convert amount from dollars to cents for API
			const amountInCents = Math.round(parseFloat(formData.amount) * 100);

			// Format date to ISO string for API
			await onSubmit({
				description: formData.description,
				amount: amountInCents,
				type: formData.type,
				categoryId: formData.categoryId || null, // Allow null for no category
				date: formData.date.toISOString(),
			});
		} catch (error) {
			console.error('Error submitting form:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4 pt-4">
			<div className="space-y-2">
				<Label htmlFor="description">
					Description
					<span className="text-red-500">*</span>
				</Label>
				<Input
					id="description"
					value={formData.description}
					onChange={(e) => handleChange('description', e.target.value)}
					placeholder="e.g., Grocery shopping"
					className={errors.description ? 'border-red-500' : ''}
				/>
				{errors.description && (
					<p className="text-red-500 text-sm mt-1">{errors.description}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="amount">
					Amount ($)
					<span className="text-red-500">*</span>
				</Label>
				<Input
					id="amount"
					type="number"
					step="0.01"
					value={formData.amount}
					onChange={(e) => handleChange('amount', e.target.value)}
					placeholder="0.00"
					className={errors.amount ? 'border-red-500' : ''}
				/>
				{errors.amount && (
					<p className="text-red-500 text-sm mt-1">{errors.amount}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="type">
					Transaction Type
					<span className="text-red-500">*</span>
				</Label>
				<RadioGroup
					value={formData.type}
					onValueChange={(value) => handleChange('type', value)}
					className="flex space-x-4"
				>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="EXPENSE" id="expense" />
						<Label htmlFor="expense" className="cursor-pointer">Expense</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="INCOME" id="income" />
						<Label htmlFor="income" className="cursor-pointer">Income</Label>
					</div>
				</RadioGroup>
			</div>

			<div className="space-y-2">
				<Label htmlFor="category">Category</Label>
				<Select
					value={formData.categoryId}
					onValueChange={(value) => handleChange('categoryId', value)}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select a category (optional)" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={null}>None</SelectItem>
						{categories.map((category) => (
							<SelectItem key={category.id} value={category.id}>
								{category.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="date">
					Date
					<span className="text-red-500">*</span>
				</Label>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn(
								"w-full justify-start text-left font-normal",
								!formData.date && "text-muted-foreground",
								errors.date && "border-red-500"
							)}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0">
						<Calendar
							mode="single"
							selected={formData.date}
							onSelect={(date) => handleChange('date', date)}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
				{errors.date && (
					<p className="text-red-500 text-sm mt-1">{errors.date}</p>
				)}
			</div>

			<div className="flex justify-end pt-4">
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Add'} Transaction
				</Button>
			</div>
		</form>
	);
};

export default TransactionForm;
