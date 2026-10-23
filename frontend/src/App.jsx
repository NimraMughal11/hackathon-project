
import "./animations.css";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  HeartPulse,
  LayoutDashboard,
  Menu,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "My Treatment Budgets", icon: Wallet },
  { label: "Expenses", icon: ClipboardList },
  { label: "AI Budget Advisor", icon: Sparkles },
  { label: "Settings", icon: Settings },
];

const CATEGORIES = [
  "Consultation",
  "Medicines",
  "Laboratory Tests",
  "Treatment",
  "Transportation",
  "Other",
];

const readStored = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
};

const money = (amount) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

function PageHeading({ title, subtitle, action }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({ title, amount, description, icon: Icon, color, trend }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-3 break-words text-2xl font-bold text-gray-900">
            {money(amount)}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={21} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-500">
        {trend === "up" ? (
          <ArrowUpRight size={15} className="text-emerald-600" />
        ) : (
          <ArrowDownRight size={15} className="text-emerald-600" />
        )}
        <span>{description}</span>
      </div>
    </div>
  );
}

function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
        <HeartPulse size={26} />
      </div>
      <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function SettingRow({ icon: Icon, title, description, children }) {
  return (
    <div className="flex flex-col gap-4 border-b border-gray-100 py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
          <Icon size={19} />
        </div>
        <div>
          <p className="font-semibold text-gray-800">{title}</p>
          <p className="mt-1 max-w-lg text-sm leading-5 text-gray-500">
            {description}
          </p>
        </div>
      </div>
      {children && <div className="sm:pl-4">{children}</div>}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50";

function App() {
  const [active, setActive] = useState("Overview");
  const [budgets, setBudgets] = useState(() =>
    readStored("sehatbudget-budgets", [])
  );
  const [expenses, setExpenses] = useState(() =>
    readStored("sehatbudget-expenses", [])
  );

  const [profileName, setProfileName] = useState(() =>
    readStored("sehatbudget-profile-name", "")
  );
  const [profileEmail, setProfileEmail] = useState(() =>
    readStored("sehatbudget-profile-email", "")
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    readStored("sehatbudget-notifications", true)
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [treatmentFilter, setTreatmentFilter] = useState("All");

  const [budgetForm, setBudgetForm] = useState({
    name: "",
    amount: "",
    startDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const blankExpense = {
    name: "",
    category: "Consultation",
    treatmentId: "",
    planned: "",
    actual: "",
    date: new Date().toISOString().slice(0, 10),
  };

  const [expenseForm, setExpenseForm] = useState(blankExpense);

  useEffect(() => {
    localStorage.setItem("sehatbudget-budgets", JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem("sehatbudget-expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(
      "sehatbudget-profile-name",
      JSON.stringify(profileName)
    );
  }, [profileName]);

  useEffect(() => {
    localStorage.setItem(
      "sehatbudget-profile-email",
      JSON.stringify(profileEmail)
    );
  }, [profileEmail]);

  useEffect(() => {
    localStorage.setItem(
      "sehatbudget-notifications",
      JSON.stringify(notificationsEnabled)
    );
  }, [notificationsEnabled]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const showNotice = (message) => setNotice(message);

  const navigate = (page) => {
    setActive(page);
    setMobileMenuOpen(false);
  };

  const totalBudget = useMemo(
    () => budgets.reduce((sum, budget) => sum + Number(budget.amount || 0), 0),
    [budgets]
  );

  const totalPlanned = useMemo(
    () => expenses.reduce((sum, expense) => sum + Number(expense.planned || 0), 0),
    [expenses]
  );

  const totalSpent = useMemo(
    () => expenses.reduce((sum, expense) => sum + Number(expense.actual || 0), 0),
    [expenses]
  );

  const remaining = totalBudget - totalSpent;
  const variance = totalSpent - totalPlanned;

  const budgetSpending = (budgetId) =>
    expenses
      .filter((expense) => expense.treatmentId === budgetId)
      .reduce((sum, expense) => sum + Number(expense.actual || 0), 0);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.name.toLowerCase().includes(search.toLowerCase()) ||
        expense.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" || expense.category === categoryFilter;

      const matchesTreatment =
        treatmentFilter === "All" || expense.treatmentId === treatmentFilter;

      return matchesSearch && matchesCategory && matchesTreatment;
    });
  }, [expenses, search, categoryFilter, treatmentFilter]);

  function openBudgetModal() {
    setBudgetForm({
      name: "",
      amount: "",
      startDate: new Date().toISOString().slice(0, 10),
      notes: "",
    });
    setModal("budget");
  }

  function saveBudget(event) {
    event.preventDefault();

    if (!budgetForm.name.trim() || Number(budgetForm.amount) <= 0) {
      showNotice("Enter a treatment name and a budget greater than zero.");
      return;
    }

    const newBudget = {
      id: crypto.randomUUID(),
      name: budgetForm.name.trim(),
      amount: Number(budgetForm.amount),
      startDate: budgetForm.startDate,
      notes: budgetForm.notes.trim(),
    };

    setBudgets((current) => [...current, newBudget]);
    setModal(null);
    showNotice("Treatment budget created successfully.");
  }

  function openExpenseModal(expense = null) {
    setEditingExpense(expense);
    setExpenseForm(
      expense
        ? {
            name: expense.name,
            category: expense.category,
            treatmentId: expense.treatmentId || "",
            planned: String(expense.planned ?? ""),
            actual: String(expense.actual ?? ""),
            date: expense.date || new Date().toISOString().slice(0, 10),
          }
        : { ...blankExpense, treatmentId: budgets[0]?.id || "" }
    );
    setModal("expense");
  }

  function saveExpense(event) {
    event.preventDefault();

    if (!expenseForm.name.trim()) {
      showNotice("Please enter an expense name.");
      return;
    }

    if (
      Number(expenseForm.planned) < 0 ||
      Number(expenseForm.actual) < 0 ||
      expenseForm.planned === "" ||
      expenseForm.actual === ""
    ) {
      showNotice("Enter valid planned and actual amounts.");
      return;
    }

    const item = {
      id: editingExpense?.id || crypto.randomUUID(),
      name: expenseForm.name.trim(),
      category: expenseForm.category,
      treatmentId: expenseForm.treatmentId,
      planned: Number(expenseForm.planned),
      actual: Number(expenseForm.actual),
      date: expenseForm.date,
    };

    if (editingExpense) {
      setExpenses((current) =>
        current.map((expense) =>
          expense.id === editingExpense.id ? item : expense
        )
      );
      showNotice("Expense updated successfully.");
    } else {
      setExpenses((current) => [item, ...current]);
      showNotice("Expense added successfully.");
    }

    setModal(null);
    setEditingExpense(null);
  }

  function deleteExpense(id) {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    setExpenses((current) => current.filter((expense) => expense.id !== id));
    showNotice("Expense deleted.");
  }

  function deleteBudget(id) {
    const hasExpenses = expenses.some((expense) => expense.treatmentId === id);

    if (hasExpenses) {
      showNotice("Remove this treatment's expenses before deleting its budget.");
      return;
    }

    if (!window.confirm("Delete this treatment budget?")) return;

    setBudgets((current) => current.filter((budget) => budget.id !== id));
    showNotice("Treatment budget deleted.");
  }

  function saveProfile(event) {
    event.preventDefault();
    setProfileName(profileName.trim());
    setProfileEmail(profileEmail.trim());
    showNotice("Profile details saved on this device.");
  }

  const userInitial = (profileName.trim()[0] || "U").toUpperCase();

  const pageTitle =
    active === "Overview"
      ? `Welcome${profileName.trim() ? `, ${profileName.trim().split(" ")[0]}` : " back"}!`
      : active;

  return (
    <div className="min-h-screen bg-[#f7f9f7] text-gray-800">
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-gray-950/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-gray-100 bg-white px-5 py-6 transition-transform duration-200 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => navigate("Overview")}
          className="mb-9 flex items-center gap-3 px-2 text-left"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-800 text-white">
            <HeartPulse size={25} />
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-gray-900">
              Sehat<span className="text-emerald-700">Budget</span>
            </p>
            <p className="mt-0.5 text-xs text-gray-500">Healthcare, planned better</p>
          </div>
        </button>

        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
          Workspace
        </p>

        <nav className="space-y-1.5">
          {NAV_ITEMS.map(({ label, icon: Icon }) => (
            <button
              type="button"
              key={label}
              onClick={() => navigate(label)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition ${
                active === label
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={19} />
              <span>{label}</span>
              {active === label && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-700" />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl bg-[#f5f8f5] p-4">
          <div className="mb-2 flex items-center gap-2 text-emerald-800">
            <ShieldCheck size={18} />
            <p className="text-sm font-semibold">Plan with confidence</p>
          </div>
          <p className="text-xs leading-5 text-gray-500">
            Keep your healthcare expenses organized in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("My Account")}
          className={`mt-5 flex w-full items-center gap-3 rounded-xl border-t border-gray-100 px-1 pt-5 text-left ${
            active === "My Account" ? "text-emerald-800" : "text-gray-700"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf4ed] font-bold text-emerald-800">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {profileName.trim() || "My Account"}
            </p>
            <p className="truncate text-xs text-gray-500">
              {profileEmail.trim() || "Set up your profile"}
            </p>
          </div>
          <Settings size={17} className="shrink-0 text-gray-400" />
        </button>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 backdrop-blur">
          <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 sm:px-7 lg:px-9">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
              >
                <Menu size={22} />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                  {pageTitle}
                </p>
                <p className="hidden text-xs text-gray-500 sm:block">
                  Your health expenses, under control.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                aria-label="Notifications"
                title="Notifications"
                onClick={() =>
                  showNotice(
                    notificationsEnabled
                      ? "You're all caught up."
                      : "Dashboard notifications are turned off."
                  )
                }
                className="relative rounded-xl border border-gray-100 p-2.5 text-gray-600 transition hover:bg-gray-50"
              >
                <Bell size={19} />
                {notificationsEnabled && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-600" />
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("My Account")}
                aria-label="Open my account"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 text-sm font-bold text-white"
              >
                {userInitial}
              </button>
              <button
                type="button"
                onClick={openBudgetModal}
                className={`${buttonPrimary} hidden sm:inline-flex`}
              >
                <Plus size={17} />
                Create Budget
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
          {active === "Overview" && (
            <>
              <PageHeading
                title="Your health expenses, under control."
                subtitle="Plan treatment costs, track every expense, and stay ahead of your budget."
                action={
                  <button
                    type="button"
                    onClick={openBudgetModal}
                    className={`${buttonPrimary} sm:hidden`}
                  >
                    <Plus size={17} />
                    Create Budget
                  </button>
                }
              />

              <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total Treatment Budget"
                  amount={totalBudget}
                  description={`${budgets.length} treatment budget${budgets.length === 1 ? "" : "s"} created`}
                  icon={Wallet}
                  color="bg-emerald-50 text-emerald-800"
                  trend="up"
                />
                <StatCard
                  title="Total Amount Spent"
                  amount={totalSpent}
                  description={`${expenses.length} recorded expense${expenses.length === 1 ? "" : "s"}`}
                  icon={CreditCard}
                  color="bg-blue-50 text-blue-700"
                  trend="up"
                />
                <StatCard
                  title="Remaining Balance"
                  amount={remaining}
                  description={remaining < 0 ? "Spent beyond total budget" : "Budget minus recorded spending"}
                  icon={CircleDollarSign}
                  color="bg-amber-50 text-amber-700"
                  trend={remaining < 0 ? "down" : "up"}
                />
                <StatCard
                  title="Spending Difference"
                  amount={Math.abs(variance)}
                  description={
                    variance > 0
                      ? "More spent than planned"
                      : variance < 0
                        ? "Spending is below plan"
                        : "Actual spending matches plan"
                  }
                  icon={TrendingUp}
                  color="bg-purple-50 text-purple-700"
                  trend={variance > 0 ? "down" : "up"}
                />
              </section>

              <section className="mb-8 rounded-2xl bg-emerald-900 p-6 text-white sm:p-8">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                  <div className="max-w-xl">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-emerald-50">
                      <Activity size={15} />
                      Your healthcare planning space
                    </div>
                    <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
                      Better planning. Less financial stress.
                    </h2>
                    <p className="mt-3 max-w-lg text-sm leading-6 text-emerald-100">
                      Set a budget for each treatment, record what you spend,
                      and understand your healthcare costs at a glance.
                    </p>
                  </div>
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center self-start rounded-3xl border border-white/10 bg-white/10 sm:h-28 sm:w-28 sm:self-center">
                    <HeartPulse size={55} strokeWidth={1.4} />
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      My Treatment Budgets
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      A quick look at your planned healthcare spending.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("My Treatment Budgets")}
                    className="shrink-0 text-sm font-semibold text-emerald-800 hover:underline"
                  >
                    View all
                  </button>
                </div>

                {budgets.length === 0 ? (
                  <EmptyState
                    title="Start with your first treatment budget"
                    description="Create a budget for a consultation, medicines, a medical test, or another treatment to get started."
                    action={
                      <button
                        type="button"
                        onClick={openBudgetModal}
                        className={buttonPrimary}
                      >
                        <Plus size={17} />
                        Create Treatment Budget
                      </button>
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {budgets.slice(0, 3).map((budget) => {
                      const spent = budgetSpending(budget.id);
                      const percentage =
                        budget.amount > 0
                          ? Math.min((spent / budget.amount) * 100, 100)
                          : 0;

                      return (
                        <div
                          key={budget.id}
                          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                              <HeartPulse size={21} />
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              spent > budget.amount
                                ? "bg-red-50 text-red-700"
                                : percentage >= 75
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-800"
                            }`}>
                              {spent > budget.amount
                                ? "Over Budget"
                                : percentage >= 75
                                  ? "Near Limit"
                                  : "On Track"}
                            </span>
                          </div>
                          <h3 className="mt-4 font-semibold text-gray-900">
                            {budget.name}
                          </h3>
                          <p className="mt-1 text-xs text-gray-500">
                            Started {budget.startDate || "not specified"}
                          </p>
                          <div className="mt-5 flex justify-between gap-3 text-sm">
                            <span className="text-gray-500">Spent</span>
                            <span className="font-semibold text-gray-900">
                              {money(spent)}
                            </span>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full transition-all ${
                                spent > budget.amount
                                  ? "bg-red-500"
                                  : "bg-emerald-600"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="mt-2 flex justify-between gap-3 text-xs text-gray-500">
                            <span>{Math.round(percentage)}% used</span>
                            <span>Budget: {money(budget.amount)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}

          {active === "My Treatment Budgets" && (
            <>
              <PageHeading
                title="My Treatment Budgets"
                subtitle="Create and manage a separate spending plan for each treatment."
                action={
                  <button type="button" onClick={openBudgetModal} className={buttonPrimary}>
                    <Plus size={17} />
                    Create Budget
                  </button>
                }
              />

              {budgets.length === 0 ? (
                <EmptyState
                  title="No treatment budgets yet"
                  description="Create your first treatment budget to start tracking planned and actual healthcare costs."
                  action={
                    <button type="button" onClick={openBudgetModal} className={buttonPrimary}>
                      <Plus size={17} />
                      Create Treatment Budget
                    </button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {budgets.map((budget) => {
                    const spent = budgetSpending(budget.id);
                    const percent =
                      budget.amount > 0
                        ? Math.min((spent / budget.amount) * 100, 100)
                        : 0;

                    return (
                      <article key={budget.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                            <HeartPulse size={21} />
                          </div>
                          <button
                            type="button"
                            aria-label={`Delete ${budget.name}`}
                            title="Delete budget"
                            onClick={() => deleteBudget(budget.id)}
                            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                        <h2 className="mt-4 text-lg font-bold text-gray-900">{budget.name}</h2>
                        {budget.notes && (
                          <p className="mt-1 text-sm text-gray-500">{budget.notes}</p>
                        )}
                        <div className="mt-5 space-y-3">
                          <div className="flex justify-between gap-3 text-sm">
                            <span className="text-gray-500">Planned budget</span>
                            <strong>{money(budget.amount)}</strong>
                          </div>
                          <div className="flex justify-between gap-3 text-sm">
                            <span className="text-gray-500">Actual spending</span>
                            <strong>{money(spent)}</strong>
                          </div>
                          <div className="flex justify-between gap-3 text-sm">
                            <span className="text-gray-500">Remaining</span>
                            <strong className={budget.amount - spent < 0 ? "text-red-600" : "text-emerald-700"}>
                              {money(budget.amount - spent)}
                            </strong>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full ${spent > budget.amount ? "bg-red-500" : "bg-emerald-600"}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <p className="text-right text-xs text-gray-500">{Math.round(percent)}% used</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTreatmentFilter(budget.id);
                            navigate("Expenses");
                          }}
                          className={`${buttonSecondary} mt-5 w-full`}
                        >
                          View related expenses
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {active === "Expenses" && (
            <>
              <PageHeading
                title="Expenses"
                subtitle="Record and compare planned costs with what you actually spend."
                action={
                  <button type="button" onClick={() => openExpenseModal()} className={buttonPrimary}>
                    <Plus size={17} />
                    Add Expense
                  </button>
                }
              />

              <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <p className="text-sm text-gray-500">Planned expenses</p>
                  <p className="mt-2 text-xl font-bold text-gray-900">{money(totalPlanned)}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <p className="text-sm text-gray-500">Actual expenses</p>
                  <p className="mt-2 text-xl font-bold text-gray-900">{money(totalSpent)}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <p className="text-sm text-gray-500">Difference</p>
                  <p className={`mt-2 text-xl font-bold ${variance > 0 ? "text-red-600" : "text-emerald-700"}`}>
                    {variance > 0 ? "+" : ""}{money(variance)}
                  </p>
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row">
                  <div className="relative min-w-0 flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      aria-label="Search expenses"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search expenses..."
                      className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-600"
                    />
                  </div>
                  <select
                    aria-label="Filter by category"
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                  >
                    <option value="All">All categories</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <select
                    aria-label="Filter by treatment"
                    value={treatmentFilter}
                    onChange={(event) => setTreatmentFilter(event.target.value)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
                  >
                    <option value="All">All treatments</option>
                    {budgets.map((budget) => (
                      <option key={budget.id} value={budget.id}>{budget.name}</option>
                    ))}
                  </select>
                </div>

                {filteredExpenses.length === 0 ? (
                  <div className="p-4">
                    <EmptyState
                      title={expenses.length ? "No matching expenses" : "No expenses recorded yet"}
                      description={expenses.length ? "Try changing your search or filters." : "Add your first expense to compare planned and actual healthcare spending."}
                      action={
                        expenses.length ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSearch("");
                              setCategoryFilter("All");
                              setTreatmentFilter("All");
                            }}
                            className={buttonSecondary}
                          >
                            Clear filters
                          </button>
                        ) : (
                          <button type="button" onClick={() => openExpenseModal()} className={buttonPrimary}>
                            <Plus size={17} />
                            Add Expense
                          </button>
                        )
                      }
                    />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                          <th className="px-5 py-4 font-semibold">Expense</th>
                          <th className="px-5 py-4 font-semibold">Treatment</th>
                          <th className="px-5 py-4 font-semibold">Planned</th>
                          <th className="px-5 py-4 font-semibold">Actual</th>
                          <th className="px-5 py-4 font-semibold">Difference</th>
                          <th className="px-5 py-4 font-semibold">Status</th>
                          <th className="px-5 py-4 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredExpenses.map((expense) => {
                          const difference = Number(expense.actual) - Number(expense.planned);
                          const treatment = budgets.find((budget) => budget.id === expense.treatmentId);

                          return (
                            <tr key={expense.id} className="transition hover:bg-gray-50/70">
                              <td className="px-5 py-4">
                                <p className="font-semibold text-gray-900">{expense.name}</p>
                                <p className="mt-1 text-xs text-gray-500">{expense.category} · {expense.date}</p>
                              </td>
                              <td className="px-5 py-4 text-gray-600">{treatment?.name || "Unassigned"}</td>
                              <td className="px-5 py-4 text-gray-700">{money(expense.planned)}</td>
                              <td className="px-5 py-4 font-semibold text-gray-900">{money(expense.actual)}</td>
                              <td className={`px-5 py-4 font-semibold ${difference > 0 ? "text-red-600" : "text-emerald-700"}`}>
                                {difference > 0 ? "+" : ""}{money(difference)}
                              </td>
                              <td className="px-5 py-4">
                                <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  difference > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"
                                }`}>
                                  {difference > 0 ? "Over Budget" : "Within Budget"}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex justify-end gap-1">
                                  <button
                                    type="button"
                                    aria-label={`Edit ${expense.name}`}
                                    title="Edit expense"
                                    onClick={() => openExpenseModal(expense)}
                                    className="rounded-lg p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-800"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label={`Delete ${expense.name}`}
                                    title="Delete expense"
                                    onClick={() => deleteExpense(expense.id)}
                                    className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
                  Showing {filteredExpenses.length} of {expenses.length} expenses
                </div>
              </section>
            </>
          )}

          {active === "AI Budget Advisor" && (
            <>
              <PageHeading
                title="AI Budget Advisor"
                subtitle="Explore a simple spending summary and budgeting suggestions."
              />

              <div className="mb-6 rounded-2xl bg-emerald-900 p-6 text-white sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <Sparkles size={26} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-200">SEHATBUDGET INSIGHTS</p>
                    <h2 className="mt-2 text-2xl font-bold">Your spending at a glance</h2>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                      <Wallet size={21} />
                    </div>
                    <h3 className="font-bold text-gray-900">Budget overview</h3>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-gray-500">Total budget</span>
                      <strong>{money(totalBudget)}</strong>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-gray-500">Total spent</span>
                      <strong>{money(totalSpent)}</strong>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-gray-500">Remaining</span>
                      <strong className={remaining < 0 ? "text-red-600" : "text-emerald-700"}>{money(remaining)}</strong>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${totalSpent > totalBudget ? "bg-red-500" : "bg-emerald-600"}`}
                        style={{ width: `${totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}% of your total budget used.` : "Create a treatment budget to begin tracking your spending."}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                      <Sparkles size={21} />
                    </div>
                    <h3 className="font-bold text-gray-900">Budgeting suggestions</h3>
                  </div>
                  <div className="mt-5 space-y-4">
                    {budgets.length === 0 && expenses.length === 0 ? (
                      <p className="rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">
                        Add a treatment budget and record expenses to see personalized summaries here.
                      </p>
                    ) : (
                      <>
                        <div className="flex gap-3 rounded-xl bg-gray-50 p-4">
                          <Check className="mt-0.5 shrink-0 text-emerald-700" size={18} />
                          <p className="text-sm leading-6 text-gray-600">
                            {totalBudget > 0
                              ? `You have set aside ${money(totalBudget)} across ${budgets.length} treatment budget${budgets.length === 1 ? "" : "s"}.`
                              : "Create treatment-specific budgets so you can compare spending against your plan."}
                          </p>
                        </div>
                        <div className="flex gap-3 rounded-xl bg-gray-50 p-4">
                          <Check className="mt-0.5 shrink-0 text-emerald-700" size={18} />
                          <p className="text-sm leading-6 text-gray-600">
                            {variance > 0
                              ? `Recorded spending is ${money(variance)} above your planned expenses. Review costs that were higher than expected.`
                              : `Recorded spending is ${money(Math.abs(variance))} ${variance < 0 ? "below" : "equal to"} your planned expenses.`}
                          </p>
                        </div>
                        {budgets.some((budget) => budgetSpending(budget.id) > budget.amount) ? (
                          <div className="flex gap-3 rounded-xl bg-red-50 p-4">
                            <Activity className="mt-0.5 shrink-0 text-red-600" size={18} />
                            <p className="text-sm leading-6 text-red-800">
                              At least one treatment has exceeded its budget. Review its expenses and update your plan if necessary.
                            </p>
                          </div>
                        ) : (
                          <div className="flex gap-3 rounded-xl bg-emerald-50 p-4">
                            <Check className="mt-0.5 shrink-0 text-emerald-700" size={18} />
                            <p className="text-sm leading-6 text-emerald-900">
                              Keep recording expenses regularly so your budget overview stays useful.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {active === "Settings" && (
            <>
              <PageHeading
                title="Settings"
                subtitle="Manage your application preferences."
              />

              <section className="max-w-3xl rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                <div className="border-b border-gray-100 pb-5">
                  <h2 className="text-lg font-bold text-gray-900">Preferences</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    These settings are saved in this browser on this device.
                  </p>
                </div>

                <SettingRow
                  icon={ShieldCheck}
                  title="Privacy and security"
                  description="Your profile and budgeting data are stored locally in this browser. This demo does not provide account authentication."
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                    <ShieldCheck size={14} />
                    Local demo
                  </span>
                </SettingRow>

                <SettingRow
                  icon={Bell}
                  title="Dashboard notifications"
                  description="Control notification messages shown inside this dashboard. This does not enable email or push notifications."
                >
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notificationsEnabled}
                    aria-label="Toggle dashboard notifications"
                    onClick={() => {
                      setNotificationsEnabled((current) => !current);
                      showNotice(
                        notificationsEnabled
                          ? "Dashboard notifications turned off."
                          : "Dashboard notifications turned on."
                      );
                    }}
                    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
                      notificationsEnabled ? "bg-emerald-700" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                        notificationsEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </SettingRow>

                <SettingRow
                  icon={CreditCard}
                  title="Currency"
                  description="All budget and expense amounts are displayed in Pakistani Rupees (PKR)."
                >
                  <span className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
                    PKR ₨
                  </span>
                </SettingRow>

                <SettingRow
                  icon={CalendarDays}
                  title="Data storage"
                  description="Budgets, expenses, and preferences are saved in this browser and can be cleared if browser site data is removed."
                >
                  <span className="text-xs font-medium text-gray-500">This device</span>
                </SettingRow>

                <div className="mt-5 rounded-xl bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-900">Need to update your profile?</p>
                  <p className="mt-1 text-sm text-emerald-800">
                    Add your name and email address from the My Account page.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("My Account")}
                    className={`${buttonSecondary} mt-3 border-emerald-100 text-emerald-800`}
                  >
                    Open My Account
                  </button>
                </div>
              </section>
            </>
          )}

          {active === "My Account" && (
            <>
              <PageHeading
                title="My Account"
                subtitle="Manage the profile details shown in your dashboard."
              />

              <section className="max-w-3xl rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-col items-start gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-800 text-2xl font-bold text-white">
                    {userInitial}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {profileName.trim() || "Your profile"}
                    </h2>
                    <p className="mt-1 break-all text-sm text-gray-500">
                      {profileEmail.trim() || "Add an email address below"}
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                      Local profile
                    </span>
                  </div>
                </div>

                <form onSubmit={saveProfile} className="mt-6 space-y-5">
                  <div>
                    <label htmlFor="profileName" className="text-sm font-semibold text-gray-700">
                      Full name
                    </label>
                    <input
                      id="profileName"
                      type="text"
                      autoComplete="name"
                      maxLength={100}
                      value={profileName}
                      onChange={(event) => setProfileName(event.target.value)}
                      placeholder="Enter your full name"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="profileEmail" className="text-sm font-semibold text-gray-700">
                      Email address
                    </label>
                    <input
                      id="profileEmail"
                      type="email"
                      autoComplete="email"
                      maxLength={150}
                      value={profileEmail}
                      onChange={(event) => setProfileEmail(event.target.value)}
                      placeholder="you@example.com"
                      className={fieldClass}
                    />
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">
                    These details are saved only in this browser. No account is created, and the information is not sent to a server.
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button type="submit" className={buttonPrimary}>
                      <Check size={17} />
                      Save Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("Settings")}
                      className={buttonSecondary}
                    >
                      Back to Settings
                    </button>
                  </div>
                </form>
              </section>
            </>
          )}
        </main>
      </div>

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-4 z-[70] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-xl sm:right-6"
        >
          <Check size={18} className="shrink-0 text-emerald-300" />
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setNotice("")}
            className="ml-1 rounded p-1 hover:bg-white/10"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {modal === "budget" && (
        <Modal title="Create Treatment Budget" onClose={() => setModal(null)}>
          <form onSubmit={saveBudget} className="space-y-4">
            <div>
              <label htmlFor="budgetName" className="text-sm font-semibold text-gray-700">
                Treatment name
              </label>
              <input
                id="budgetName"
                required
                maxLength={100}
                value={budgetForm.name}
                onChange={(event) => setBudgetForm({ ...budgetForm, name: event.target.value })}
                placeholder="e.g. Dental Treatment"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="budgetAmount" className="text-sm font-semibold text-gray-700">
                Planned budget (PKR)
              </label>
              <input
                id="budgetAmount"
                required
                type="number"
                min="1"
                step="1"
                value={budgetForm.amount}
                onChange={(event) => setBudgetForm({ ...budgetForm, amount: event.target.value })}
                placeholder="e.g. 25000"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="budgetDate" className="text-sm font-semibold text-gray-700">
                Start date
              </label>
              <input
                id="budgetDate"
                type="date"
                value={budgetForm.startDate}
                onChange={(event) => setBudgetForm({ ...budgetForm, startDate: event.target.value })}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="budgetNotes" className="text-sm font-semibold text-gray-700">
                Notes (optional)
              </label>
              <textarea
                id="budgetNotes"
                rows={3}
                maxLength={500}
                value={budgetForm.notes}
                onChange={(event) => setBudgetForm({ ...budgetForm, notes: event.target.value })}
                placeholder="Add any helpful details..."
                className={fieldClass}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setModal(null)} className={buttonSecondary}>
                Cancel
              </button>
              <button type="submit" className={buttonPrimary}>
                <Plus size={17} />
                Create Budget
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "expense" && (
        <Modal
          title={editingExpense ? "Edit Expense" : "Add Expense"}
          onClose={() => {
            setModal(null);
            setEditingExpense(null);
          }}
        >
          <form onSubmit={saveExpense} className="space-y-4">
            <div>
              <label htmlFor="expenseName" className="text-sm font-semibold text-gray-700">
                Expense name
              </label>
              <input
                id="expenseName"
                required
                maxLength={150}
                value={expenseForm.name}
                onChange={(event) => setExpenseForm({ ...expenseForm, name: event.target.value })}
                placeholder="e.g. Doctor Consultation"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="expenseCategory" className="text-sm font-semibold text-gray-700">
                Category
              </label>
              <select
                id="expenseCategory"
                value={expenseForm.category}
                onChange={(event) => setExpenseForm({ ...expenseForm, category: event.target.value })}
                className={fieldClass}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="expenseTreatment" className="text-sm font-semibold text-gray-700">
                Treatment budget
              </label>
              <select
                id="expenseTreatment"
                value={expenseForm.treatmentId}
                onChange={(event) => setExpenseForm({ ...expenseForm, treatmentId: event.target.value })}
                className={fieldClass}
              >
                <option value="">Unassigned</option>
                {budgets.map((budget) => (
                  <option key={budget.id} value={budget.id}>{budget.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="expensePlanned" className="text-sm font-semibold text-gray-700">
                  Planned cost (PKR)
                </label>
                <input
                  id="expensePlanned"
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={expenseForm.planned}
                  onChange={(event) => setExpenseForm({ ...expenseForm, planned: event.target.value })}
                  placeholder="0"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="expenseActual" className="text-sm font-semibold text-gray-700">
                  Actual cost (PKR)
                </label>
                <input
                  id="expenseActual"
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={expenseForm.actual}
                  onChange={(event) => setExpenseForm({ ...expenseForm, actual: event.target.value })}
                  placeholder="0"
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="expenseDate" className="text-sm font-semibold text-gray-700">
                Expense date
              </label>
              <input
                id="expenseDate"
                required
                type="date"
                value={expenseForm.date}
                onChange={(event) => setExpenseForm({ ...expenseForm, date: event.target.value })}
                className={fieldClass}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setModal(null);
                  setEditingExpense(null);
                }}
                className={buttonSecondary}
              >
                Cancel
              </button>
              <button type="submit" className={buttonPrimary}>
                <Check size={17} />
                {editingExpense ? "Save Changes" : "Add Expense"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default App;
