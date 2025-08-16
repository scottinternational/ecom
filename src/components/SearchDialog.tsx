import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Package, Users, ShoppingCart, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "product" | "user" | "order" | "page";
  url: string;
  icon: React.ReactNode;
}

const mockSearchResults: SearchResult[] = [
  {
    id: "1",
    title: "Smart Fitness Tracker",
    description: "Product in R&D phase",
    type: "product",
    url: "/products",
    icon: <Package className="h-4 w-4" />,
  },
  {
    id: "2",
    title: "Wireless Earbuds Pro",
    description: "Live product on Amazon",
    type: "product",
    url: "/products",
    icon: <Package className="h-4 w-4" />,
  },
  {
    id: "3",
    title: "John Doe",
    description: "Channel Director A",
    type: "user",
    url: "/users",
    icon: <Users className="h-4 w-4" />,
  },
  {
    id: "4",
    title: "Order #ORD-001",
    description: "Recent order from Amazon",
    type: "order",
    url: "/operations",
    icon: <ShoppingCart className="h-4 w-4" />,
  },
  {
    id: "5",
    title: "Production Dashboard",
    description: "Track production status",
    type: "page",
    url: "/production",
    icon: <FileText className="h-4 w-4" />,
  },
];

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filteredResults = mockSearchResults.filter(
    (result) =>
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setOpen(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative max-w-md cursor-pointer">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search products, orders, teams..." 
            className="pl-10 w-80 bg-background/50"
            readOnly
          />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
          
          {query && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => handleResultClick(result)}
                  >
                    {result.icon}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{result.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {result.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No results found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}