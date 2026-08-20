package main

import (
	"context"
	"fmt"
	"github.com/redis/go-redis/v9"
)

func main() {
	rdb := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
		Password: "anotherkindofsupersecretpass",
	})
	
	ctx := context.Background()
	keys, _ := rdb.Keys(ctx, "*").Result()
	fmt.Println("Keys:", keys)
}
