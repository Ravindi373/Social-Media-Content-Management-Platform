# Social Media Content Management Platform (SMCMP)
## System Design Document — Serene Bay Resort & Kitchen (Hotel/Restaurant)
CCS4360 – Techniques in Social Media

---

## 1. Client Overview

**Organisation:** Serene Bay Resort & Kitchen — a boutique hotel with an in-house restaurant.
Two content streams under one brand: hotel (rooms, packages, events) and restaurant (dishes, promotions, chef specials).

---

## 2. Tech Stack

| Layer | Choice | Reasoning |
|---|---|---|
| Frontend | React + Bootstrap | Component-based, fast to build role-based views |
| Backend | Node.js + Express | Simple REST API, easy to demo live |
| Database | MySQL + Sequelize ORM | Relational schema demonstrates normalized design for marking criteria |
| Auth | JWT-based login | Standard, easy to implement role checks |

---

## 3. Database Design (ERD Summary)

**Tables:**

1. **USERS** — id (PK), name, email, password_hash, role (Administrator / Content Creator / Content Approver)
2. **CAMPAIGNS** — id (PK), name, type (Product Launch / Awareness / Event Promotion), objective, start_date, end_date
3. **POSTS** — id (PK), campaign_id (FK), created_by (FK → Users), caption, image_url, hashtags, platforms, status (draft / pending_approval / approved / scheduled / published / rejected), scheduled_date, scheduled_time
4. **APPROVALS** — id (PK), post_id (FK), approver_id (FK → Users), status (approved / rejected / pending), comments, reviewed_at
5. **ANALYTICS** — id (PK), post_id (FK), platform, likes, shares, comments, reach
6. **CONSENT_LOGS** — id (PK), post_id (FK), guest_name, consent_given (boolean), date

**Relationships:**
- One User creates many Posts
- One User (Approver) reviews many Approvals
- One Campaign groups many Posts
- One Post has many Approval records (revision history)
- One Post generates many Analytics records (one per platform)
- One Post may have many Consent Log entries (if guests appear in the content)

> Note: `platforms` and `hashtags` are stored as delimited fields on Posts for simplicity. For a stricter 3NF design (bonus marks), split these into `PLATFORMS` and `POST_PLATFORMS` join tables plus a `HASHTAGS` table.

---

## 4. User Roles & Permissions Matrix

| Feature | Administrator | Content Creator | Content Approver |
|---|---|---|---|
| Manage users | Yes | No | No |
| Create / edit posts | Yes | Yes | No |
| Approve / reject posts | Yes | No | Yes |
| Schedule posts | Yes | Yes (after approval) | No |
| Manage campaigns | Yes | Yes (create) | Yes (view) |
| View analytics | Yes | Yes | Yes |
| View strategy page | Yes | Yes | Yes |

---

## 5. Content Approval Workflow

```
Draft → Pending Approval → Approved → Scheduled → Published
                 ↓
             Rejected → back to Draft (with Approver comments)
```

1. Content Creator drafts a post and submits for approval.
2. Content Approver reviews: approve (moves to scheduling) or reject (returns to draft with comments).
3. Approved posts are scheduled with a date/time.
4. On the scheduled time, status moves to Published (simulated for the prototype — no live API call required unless attempting the bonus marks).

---

## 6. Page List (10 pages)

1. **Login** — role-based authentication
2. **Dashboard** — role-specific view of scheduled / published / draft posts
3. **Create / Edit Post** — caption, image upload, hashtags, platform selection, save as draft
4. **Content Calendar** — visual scheduling view
5. **Approval Queue** — Approver/Admin only; approve, reject, comment
6. **Campaign Management** — create/view campaigns, link posts to campaigns
7. **Analytics Dashboard** — posts count, likes, shares, comments, reach (sample data)
8. **Social Media Strategy** — best posting times, suggested hashtags, target audience, objectives
9. **Privacy & Compliance** — privacy notice, consent log, data protection statement, social media guidelines
10. **User Management** — Admin only; add/edit/remove users and roles

---

## 7. Sample Dataset Plan (15–20 records)

- ~8 hotel-focused posts: room packages, seasonal offers, hotel events (draft/scheduled/published mixed)
- ~8 restaurant-focused posts: dish features, chef specials, dining promotions
- 3–4 campaign entries: "New Menu Launch," "Weekend Getaway Awareness," "Festive Season Promotion"
- A few consent log entries tied to posts featuring guest photos

---

## 8. Privacy & Compliance Considerations

- **Guest photo consent** — required whenever real guests appear in hotel/restaurant content; tracked via the Consent Logs table.
- **Data protection statement** — outlines what user/guest data is stored and why.
- **Social media guidelines** — internal rules for staff on tone, brand voice, and what not to post.
- **User consent on account creation** — acknowledgement of data handling policy at signup.

---

## 9. Next Steps

- [ ] Wireframes / UI mockups for each of the 10 pages
- [ ] Set up project repo + Trello/Jira board for tracking contributions
- [ ] Scaffold backend (Express routes + Sequelize models matching ERD above)
- [ ] Scaffold frontend (React pages + routing by role)
- [ ] Seed database with sample dataset (15–20 records)
- [ ] Build approval workflow logic
- [ ] Build analytics dashboard with sample/mock data
- [ ] Write privacy & compliance page content
- [ ] Record presentation (10 min) and demo (10 min) videos
