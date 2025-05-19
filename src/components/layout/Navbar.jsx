import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
	LayoutDashboard,
	Tags,
	LogOut,
	ChevronDown,
	Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

function Navbar() {
	const { user, logout } = useAuth();
	const location = useLocation();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const navigation = [
		{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
		{ name: 'Categories', href: '/categories', icon: Tags },
	];

	const handleLogout = () => {
		logout();
	};

	return (
		<header className="bg-white border-b border-gray-200 sticky top-0 z-10">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex">
						<div className="flex-shrink-0 flex items-center">
							<h1 className="text-xl font-bold text-gray-900">Expense Tracker</h1>
						</div>

						{/* Desktop navigation */}
						<nav className="hidden md:ml-6 md:flex md:space-x-4">
							{navigation.map((item) => {
								const isActive = location.pathname === item.href;
								return (
									<Link
										key={item.name}
										to={item.href}
										className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive
												? 'bg-gray-100 text-gray-900'
												: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
											}`}
									>
										<item.icon className="h-4 w-4 mr-2" />
										{item.name}
									</Link>
								);
							})}
						</nav>
					</div>

					<div className="flex items-center">
						{/* User dropdown */}
						<div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" className="flex items-center text-sm">
										<span className="mr-2">
											{user?.firstName} {user?.lastName}
										</span>
										<ChevronDown className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={handleLogout}>
										<LogOut className="mr-2 h-4 w-4" />
										<span>Logout</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						{/* Mobile menu button */}
						<div className="flex md:hidden">
							<Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
								<SheetTrigger asChild>
									<Button variant="ghost" size="icon">
										<Menu className="h-6 w-6" />
									</Button>
								</SheetTrigger>
								<SheetContent side="right">
									<div className="flex flex-col space-y-4 py-4">
										{navigation.map((item) => {
											const isActive = location.pathname === item.href;
											return (
												<Link
													key={item.name}
													to={item.href}
													className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive
															? 'bg-gray-100 text-gray-900'
															: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
														}`}
													onClick={() => setIsMobileMenuOpen(false)}
												>
													<item.icon className="h-4 w-4 mr-2" />
													{item.name}
												</Link>
											);
										})}

										<Button
											variant="ghost"
											className="flex items-center justify-start px-3 py-2 text-sm font-medium text-red-600"
											onClick={() => {
												handleLogout();
												setIsMobileMenuOpen(false);
											}}
										>
											<LogOut className="h-4 w-4 mr-2" />
											Logout
										</Button>
									</div>
								</SheetContent>
							</Sheet>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}

export default Navbar;
