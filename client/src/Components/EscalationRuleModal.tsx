import { useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Stack,
	TextField,
	Button,
	Autocomplete,
	FormHelperText,
	useTheme,
} from "@mui/material";
import type { EscalationRule } from "@/Types/Monitor";
import type { Notification } from "@/Types/Notification";
import { LAYOUT } from "@/Utils/Theme/constants";

interface EscalationRuleModalProps {
	open: boolean;
	rule?: EscalationRule;
	notifications: Notification[];
	onSave: (rule: EscalationRule) => void;
	onClose: () => void;
}

export const EscalationRuleModal = ({
	open,
	rule,
	notifications,
	onSave,
	onClose,
}: EscalationRuleModalProps) => {
	const theme = useTheme();

	const [timeValue, setTimeValue] = useState<number>(rule?.afterMinutes ?? 5);
	const [selectedNotifications, setSelectedNotifications] = useState<Notification[]>(
		rule
			? notifications.filter((n) => rule.notificationIds.includes(n.id))
			: []
	);
	const [enabled, setEnabled] = useState(rule?.enabled ?? true);
	const [errors, setErrors] = useState<{ time?: string; notifications?: string }>({});

	const handleReset = () => {
		setTimeValue(rule?.afterMinutes ?? 5);
		setSelectedNotifications(
			rule ? notifications.filter((n) => rule.notificationIds.includes(n.id)) : []
		);
		setEnabled(rule?.enabled ?? true);
		setErrors({});
	};

	const validateForm = (): boolean => {
		const newErrors: { time?: string; notifications?: string } = {};

		if (!timeValue || timeValue < 1 || timeValue > 1440) {
			newErrors.time = "Time must be between 1 and 1440 minutes";
		}

		if (selectedNotifications.length === 0) {
			newErrors.notifications = "Select at least one notification channel";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSave = () => {
		if (!validateForm()) {
			return;
		}

		const newRule: EscalationRule = {
			afterMinutes: timeValue,
			notificationIds: selectedNotifications.map((n) => n.id),
			enabled,
		};

		onSave(newRule);
		handleReset();
		onClose();
	};

	const handleClose = () => {
		handleReset();
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>
				{rule
					? "Edit Escalation Rule"
					: "Add Escalation Rule"}
			</DialogTitle>

			<DialogContent>
				<Stack spacing={theme.spacing(LAYOUT.MD)} sx={{ mt: 2 }}>
					{/* Time Input */}
					<Stack>
						<TextField
							type="number"
							label="Minutes after downstart"
							value={timeValue}
							onChange={(e) => {
								setTimeValue(parseInt(e.target.value) || 0);
								if (errors.time) {
									setErrors({ ...errors, time: undefined });
								}
							}}
							inputProps={{ min: 1, max: 1440 }}
							error={!!errors.time}
							fullWidth
						/>
						{errors.time && <FormHelperText error>{errors.time}</FormHelperText>}
					</Stack>

					{/* Notification Select */}
					<Stack>
						<Autocomplete
							multiple
							options={notifications}
							value={selectedNotifications}
							onChange={(_: unknown, newValue: Notification[]) => {
								setSelectedNotifications(newValue);
								if (errors.notifications) {
									setErrors({ ...errors, notifications: undefined });
								}
							}}
							getOptionLabel={(option) => option.notificationName}
							isOptionEqualToValue={(option, value) => option.id === value.id}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Notification channels"
									error={!!errors.notifications}
								/>
							)}
						/>
						{errors.notifications && (
							<FormHelperText error>{errors.notifications}</FormHelperText>
						)}
					</Stack>
				</Stack>
			</DialogContent>

			<DialogActions>
				<Button onClick={handleClose} variant="outlined">
					Cancel
				</Button>
				<Button onClick={handleSave} variant="contained">
					Save Rule
				</Button>
			</DialogActions>
		</Dialog>
	);
};
