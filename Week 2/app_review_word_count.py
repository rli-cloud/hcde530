"""
app_review_word_count.py

Creates 50 sample app reviews, counts words in each review,
and prints shortest, longest, and average review length.
"""


def count_words(text):
    """Return the number of words in a string."""
    return len(text.split())


reviews = [
    "The app is clean, fast, and easy to use for daily planning.",
    "I like the reminders but wish recurring tasks were more flexible.",
    "Great layout and colors, but syncing across devices sometimes fails.",
    "The onboarding was simple and helped me start quickly.",
    "Search works well and I can find old notes instantly.",
    "Notifications arrive late, so I miss time-sensitive tasks.",
    "I appreciate the dark mode and readable typography.",
    "The app crashes when I attach large image files.",
    "Calendar integration saves me a lot of time each week.",
    "I want keyboard shortcuts for faster desktop workflow.",
    "The free version is useful, but key features are paywalled.",
    "Customer support replied quickly and solved my login issue.",
    "Sharing lists with my team is smooth and reliable.",
    "Sometimes the loading spinner stays forever on weak networks.",
    "I love the progress charts and weekly insights.",
    "The latest update improved performance on my old phone.",
    "Tagging is helpful, though nested tags would be better.",
    "It is intuitive enough that I did not need a tutorial.",
    "I wish there were more export options for reports.",
    "The widget on my home screen is very convenient.",
    "Offline mode is excellent during travel with poor connectivity.",
    "Battery usage seems high compared with similar apps.",
    "The font size controls make accessibility much better for me.",
    "I found a bug where completed tasks reappear after refresh.",
    "The design is minimal and keeps me focused.",
    "Pricing feels fair for the amount of value provided.",
    "I had trouble resetting my password from the email link.",
    "Cross-platform support is strong and setup was quick.",
    "Please add the option to pin important projects at the top.",
    "The tutorial videos were short and actually useful.",
    "I can collaborate with my classmates without confusion now.",
    "Occasional lag appears when opening very large project boards.",
    "The app helps me build routines and stay accountable.",
    "I would like better color contrast in chart labels.",
    "Backup and restore worked perfectly when I changed devices.",
    "The interface is polished and feels professional.",
    "I like the quick add button for capturing ideas instantly.",
    "Too many popups ask me to upgrade every day.",
    "The dashboard gives me a clear snapshot of my week.",
    "It takes too many taps to edit recurring reminders.",
    "Voice input is accurate and saves typing time.",
    "I appreciate the transparent changelog after each release.",
    "Some icons are unclear and took time to understand.",
    "The app starts quickly even on older hardware.",
    "I would recommend this to students managing multiple deadlines.",
    "Please support custom themes for better personalization.",
    "The collaborative comments feature has improved our teamwork.",
    "I experienced random sign-outs that interrupted my work.",
    "Overall, this app has become part of my daily routine.",
    "Simple features done well make this app stand out.",
]


print(f"{'Review #':<8} {'Words':<6} Review Preview")
print("-" * 75)

word_counts = []

for i, review in enumerate(reviews, start=1):
    words = count_words(review)
    word_counts.append(words)
    preview = review if len(review) <= 65 else review[:65] + "..."
    print(f"{i:<8} {words:<6} {preview}")

print()
print("Summary")
print("-" * 30)
print(f"Total reviews : {len(reviews)}")
print(f"Shortest      : {min(word_counts)} words")
print(f"Longest       : {max(word_counts)} words")
print(f"Average       : {sum(word_counts) / len(word_counts):.1f} words")
