import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Routes, Route, Link, useSearchParams, Outlet } from "react-router-dom";

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q");   // ?q=hello
  const buldit = searchParams.get("buldit"); // ?page=2

  return (
    <div className="m-5">
      <h1>Search Page</h1>
      <p>Query: {query}</p>
      <p>Page: {buldit}</p>

      <button onClick={() => setSearchParams({ q: "react", buldit: 3 })}>
        Update Query
      </button>
    </div>
  );
}

function Fruit() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState();
  const [items, setItems] = useState(['Apple', 'Banana,', 'Kiwis']);
  const q = searchParams.get('q');

  const inputHandler = (e) => {
    setQuery(e.target.value);
  }

  const queryHandler = () => {
    setSearchParams({ q: query });
  }

  const filteredItems = items.filter(i => i.toLowerCase().includes((q || '').toLowerCase()));

  return (
    <>
      <input className="border m-5" value={query} onChange={inputHandler} />
      <button className="border p-2" onClick={queryHandler}>Search</button>
      <p className="m-5">Query - {query}</p>
      <p className="m-5">Q - {q}</p>
      {
        filteredItems.map(item => (
          <div className="m-5">
            <h1>{item}</h1>
          </div>
        ))
      }
    </>
  );
}

function RoutesForSearch() {
  return (
    <>
      <div className="flex gap-5 m-5">
        <Link to={'/?q=hello&buldit=3'}>Search</Link>
        <Link to={'/fruit'}>Fruit</Link>
      </div>

      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/fruit" element={<Fruit />} />
      </Routes>
    </>
  );
}

function Dashboard() {
  return (
    <>
      <div className="m-5">
        <h1>Dashboard Panel</h1>
        <Link to={'profile'}>Profile</Link>

        <Outlet />
      </div>
    </>
  );
}

function Profile() {
  return <h1 className="m-5">Profile</h1>
}

function NestedRoute() {
  return (
    <>
      <div className="m-5">
        <Link to={'/dashboard'}>Dashboard</Link>
      </div>

      <div>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

function HookForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const firstName = watch("firstName");

  const showData = (data) => {
    console.log(data);
  }

  return (
    <>
      <form onSubmit={handleSubmit(showData)}>
        <div className="flex flex-col m-5">
          <label>First name - {firstName}</label>
          <input {...register("firstName",
            {
              required: 'Name is required',
              minLength: { value: 3, message: 'Min character is 3' },
              maxLength: { value: 6, message: 'Max character is 6' }
            })}
            className="border" />
          {errors.firstName && <p className="text-red-500">{errors.firstName.message}</p>}

          <label>Last Name</label>
          <input {...register('lastName')} className="border" />

          <button className="border p-2 mt-2">Submit</button>
        </div>
      </form>
    </>
  );
}

function App() {
  const queryClient = useQueryClient();
  const [product, setProduct] = useState({
    id: '',
    name: '',
    price: ''
  });

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('https://localhost:7284/api/product', {
        method: 'GET'
      });

      return await response.json();
    }
  });

  const mutation = useMutation({
    mutationFn: async (newProduct) => {
      const response = await fetch('https://localhost:7284/api/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });

    }, onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    }
  });

  const inputHandler = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  }

  const addProduct = () => {
    mutation.mutate(product);
    setProduct({ id: '', name: '', price: '' });
  }

  if (isLoading) return <h1>Loading...</h1>;
  if (error) return <h1>Error fetching data</h1>;

  return (
    <>
      {
        products.map(product => (
          <div className="m-5">
            <h1>ID: {product.id}, Name: {product.name}, Price: {product.price}$</h1>
          </div>
        ))
      }
      <div className="border mt-5"></div>
      <div className="flex flex-col m-5">
        <label>ID - {product.id}</label>
        <input name="id" value={product.id} className="border" onChange={inputHandler} />

        <label>Name - {product.name}</label>
        <input name="name" value={product.name} className="border" onChange={inputHandler} />

        <label>Price - {product.price}</label>
        <input name="price" value={product.price} className="border" onChange={inputHandler} />

        <button className="border mt-2" onClick={addProduct}>Add</button>
      </div>
    </>
  );
}

export default App;
