function AchievementCard({ icon, unlocked }: { icon: string, unlocked: boolean }) {
	return (
		<div>
			<p>sup</p>
		</div>
	)
}

function Achievements(user: string) {
	return (
		<AchievementCard icon={"text"} unlocked={true} />
	)
}